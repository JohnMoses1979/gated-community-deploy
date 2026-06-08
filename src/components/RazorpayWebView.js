/**
 * RazorpayWebView.js
 *
 * FINAL APPROACH — Two modes in one component:
 *
 * TEST MODE  (current): Fully simulated payment UI. No Razorpay modal opened.
 *   - Tapping "Pay" immediately calls onSuccess with a fake paymentId.
 *   - Zero dependency on the demo key having methods enabled.
 *   - Shows realistic card/UPI UI so you can demo the full flow.
 *
 * PRODUCTION MODE: When you go live, swap RAZORPAY_KEY to your real live key
 *   and set IS_TEST_MODE = false. The component will then open the real
 *   Razorpay checkout modal (all methods enabled on live keys).
 *
 * ── To go live ────────────────────────────────────────────────────────────
 *   1. In your Razorpay dashboard → Settings → API Keys → Generate Live Key
 *   2. Replace RAZORPAY_KEY with your 'rzp_live_...' key
 *   3. Set IS_TEST_MODE = false
 *   4. Done. No other code changes needed.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Drop at: src/components/RazorpayWebView.js
 */

import React, { useRef, useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import { WebView } from 'react-native-webview';

// ─── CONFIG — change these when going live ────────────────────────────────────
const RAZORPAY_KEY = 'rzp_test_1DP5mmOlF5G5ag';
const IS_TEST_MODE = true;   // ← set false when deploying with real key
// ─────────────────────────────────────────────────────────────────────────────

// ── TEST MODE HTML ─────────────────────────────────────────────────────────────
// Fully self-contained simulated payment page.
// Does NOT open the Razorpay modal at all — just pretends.
function buildTestHTML({ amount, name, description }) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,sans-serif;background:#f0fafa;min-height:100vh}

    .hdr{background:#1A7A7A;padding:16px 20px}
    .hdr h2{color:#fff;font-size:17px;font-weight:800}
    .hdr p{color:rgba(255,255,255,.7);font-size:12px;margin-top:3px}

    .amt{margin:16px;background:#fff;border-radius:14px;padding:16px 18px;
      border:1px solid #D0EEEE;display:flex;justify-content:space-between;align-items:center}
    .amt .lbl{font-size:12px;color:#7A9E9E;font-weight:700}
    .amt .sub{font-size:11px;color:#94A3B8;margin-top:2px}
    .amt .val{font-size:26px;font-weight:900;color:#1A7A7A}

    .badge{margin:0 16px 16px;background:#FFF3CD;border-radius:10px;
      padding:9px 14px;font-size:12px;color:#856404;font-weight:700;text-align:center}

    .tabs{display:flex;margin:0 16px 16px;border-radius:12px;
      border:1px solid #D0EEEE;overflow:hidden;background:#fff}
    .tab{flex:1;padding:12px 0;font-size:13px;font-weight:600;
      color:#7A9E9E;border:none;background:transparent;cursor:pointer}
    .tab.on{background:#1A7A7A;color:#fff;font-weight:800}

    .panel{display:none;margin:0 16px}
    .panel.on{display:block}

    .chip-title{font-size:11px;color:#7A9E9E;font-weight:700;
      text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px}
    .chip{display:block;width:100%;background:#E8F5F5;border:1.5px solid #B2DFDB;
      border-radius:10px;padding:10px 14px;font-size:13px;color:#1A7A7A;
      font-weight:700;cursor:pointer;text-align:left;margin-bottom:8px;
      -webkit-appearance:none}
    .chip small{display:block;font-size:11px;color:#7A9E9E;
      letter-spacing:1.5px;font-weight:500;margin-top:2px}

    .fld{margin-bottom:14px}
    .fld label{display:block;font-size:11px;font-weight:700;color:#7A9E9E;
      text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px}
    input{width:100%;padding:13px 14px;border:1.5px solid #D0EEEE;
      border-radius:10px;font-size:15px;color:#1A2E2E;
      background:#fff;outline:none;-webkit-appearance:none}
    input:focus{border-color:#1A7A7A}
    .row{display:flex;gap:12px}
    .row .fld{flex:1}

    .upi-tip{background:#EFF6FF;border-radius:12px;padding:13px 14px;
      font-size:13px;color:#1e40af;margin-bottom:14px;line-height:1.55}

    .pay-btn{width:100%;padding:16px;background:#D4AF5A;color:#1A2E2E;
      font-size:16px;font-weight:900;border:none;border-radius:14px;
      cursor:pointer;margin-top:4px;-webkit-appearance:none;
      transition:opacity .15s}
    .pay-btn:active{opacity:.8}
    .pay-btn:disabled{background:#94A3B8;cursor:default}

    /* Processing overlay */
    #ov{display:none;position:fixed;inset:0;
      background:rgba(240,250,250,.97);flex-direction:column;
      align-items:center;justify-content:center;gap:14px;z-index:99}
    #ov.on{display:flex}
    .spin{width:52px;height:52px;border:4px solid #D0EEEE;
      border-top:4px solid #1A7A7A;border-radius:50%;
      animation:sp .8s linear infinite}
    @keyframes sp{to{transform:rotate(360deg)}}
    .ov-h{font-size:17px;font-weight:800;color:#1A7A7A}
    .ov-s{font-size:13px;color:#7A9E9E}

    /* Success overlay */
    #sv{display:none;position:fixed;inset:0;
      background:#f0fafa;flex-direction:column;
      align-items:center;justify-content:center;gap:14px;
      padding:30px;z-index:100}
    #sv.on{display:flex}
    .check{font-size:72px}
    .sv-h{font-size:20px;font-weight:900;color:#1A7A7A;text-align:center}
    .sv-id{font-size:12px;color:#7A9E9E;text-align:center;letter-spacing:.5px;margin-top:-6px}
    .sv-btn{width:100%;max-width:320px;padding:16px;background:#1A7A7A;
      color:#fff;font-size:15px;font-weight:800;border:none;
      border-radius:14px;cursor:pointer;-webkit-appearance:none}

    .pb{height:40px}
  </style>
</head>
<body>

<div class="hdr">
  <h2>💳 Secure Payment</h2>
  <p>${name || 'BSGated Marketplace'} · Test Mode</p>
</div>

<div class="amt">
  <div>
    <div class="lbl">Amount to Pay</div>
    <div class="sub">${description || 'Order payment'}</div>
  </div>
  <div class="val">₹${amount}</div>
</div>

<div class="badge">⚡ TEST MODE — No real money is charged</div>

<div class="tabs">
  <button class="tab on" id="t-card" onclick="sw('card')">💳 Card</button>
  <button class="tab"    id="t-upi"  onclick="sw('upi')">📱 UPI</button>
</div>

<!-- Card Panel -->
<div class="panel on" id="p-card">
  <div class="chip-title">⚡ Tap a test card to auto-fill</div>

  <button class="chip" onclick="fill(0)">
    ✅ Visa — Auto-success
    <small>4111 1111 1111 1111</small>
  </button>
  <button class="chip" onclick="fill(1)">
    ✅ Mastercard — Auto-success
    <small>5267 3187 2000 0000</small>
  </button>
  <button class="chip" onclick="fill(2)">
    ✅ RuPay — Auto-success
    <small>6074 6670 2255 6189</small>
  </button>

  <div class="fld">
    <label>Card Number</label>
    <input type="tel" id="cn" placeholder="4111 1111 1111 1111" maxlength="19"
      oninput="fc(this)" inputmode="numeric"/>
  </div>
  <div class="fld">
    <label>Name on Card</label>
    <input type="text" id="ch" placeholder="Test User"/>
  </div>
  <div class="row">
    <div class="fld">
      <label>Expiry MM/YY</label>
      <input type="tel" id="ce" placeholder="12/25" maxlength="5"
        oninput="fe(this)" inputmode="numeric"/>
    </div>
    <div class="fld">
      <label>CVV</label>
      <input type="tel" id="cv" placeholder="123" maxlength="4" inputmode="numeric"/>
    </div>
  </div>
  <button class="pay-btn" id="cbtn" onclick="doPay('card')">💳 Pay ₹${amount}</button>
</div>

<!-- UPI Panel -->
<div class="panel" id="p-upi">
  <div class="upi-tip">
    ℹ️ This is <b>test mode</b>. The UPI ID below is pre-filled with Razorpay's
    official test VPA. Tap Pay and the payment will instantly succeed.
  </div>
  <div class="fld">
    <label>UPI ID (VPA)</label>
    <input type="text" id="upi" value="success@razorpay" placeholder="success@razorpay"/>
  </div>
  <button class="pay-btn" id="ubtn" onclick="doPay('upi')">📱 Pay ₹${amount} via UPI</button>
</div>
<div class="pb"></div>

<!-- Processing overlay -->
<div id="ov">
  <div class="spin"></div>
  <div class="ov-h">Verifying Payment…</div>
  <div class="ov-s">Do not close this screen</div>
</div>

<!-- Success overlay -->
<div id="sv">
  <div class="check">✅</div>
  <div class="sv-h">Payment Successful!</div>
  <div class="sv-id" id="sv-id"></div>
  <div class="ov-s">Redirecting to your order…</div>
</div>

<script>
(function(){
  var CARDS = [
    {n:'4111111111111111', e:'12/25', c:'123'},
    {n:'5267318720000000', e:'12/25', c:'123'},
    {n:'6074667022556189', e:'12/25', c:'123'},
  ];

  window.fill = function(i){
    var cd = CARDS[i];
    document.getElementById('cn').value = fmt4(cd.n);
    document.getElementById('ch').value = 'Test User';
    document.getElementById('ce').value = cd.e;
    document.getElementById('cv').value = cd.c;
  };

  // Auto-fill card 0 on load
  fill(0);

  window.sw = function(tab){
    ['card','upi'].forEach(function(t){
      document.getElementById('t-'+t).classList.toggle('on', t===tab);
      document.getElementById('p-'+t).classList.toggle('on', t===tab);
    });
  };

  window.fc = function(el){
    el.value = fmt4(el.value.replace(/\\D/g,'').substring(0,16));
  };
  window.fe = function(el){
    var v = el.value.replace(/\\D/g,'').substring(0,4);
    el.value = v.length > 2 ? v.substring(0,2)+'/'+v.substring(2) : v;
  };

  function fmt4(s){ return s.replace(/(\\d{4})(?=\\d)/g,'$1 '); }

  function rn(type, data){
    if(window.ReactNativeWebView){
      window.ReactNativeWebView.postMessage(JSON.stringify({type:type, data:data||{}}));
    }
  }

  function fakePid(){
    // Generates a realistic-looking Razorpay test payment ID
    return 'pay_test_' + Math.random().toString(36).substring(2,12).toUpperCase();
  }

  window.doPay = function(method){
    // Validate
    if(method === 'card'){
      var num = document.getElementById('cn').value.replace(/\\s/g,'');
      var exp = document.getElementById('ce').value;
      var cvv = document.getElementById('cv').value;
      if(num.length < 13){ alert('Please enter a valid card number'); return; }
      if(exp.length < 5) { alert('Please enter expiry (MM/YY)'); return; }
      if(cvv.length < 3) { alert('Please enter CVV'); return; }
    } else {
      var vpa = document.getElementById('upi').value.trim();
      if(!vpa){ alert('Please enter UPI ID'); return; }
    }

    // Disable button
    var btn = document.getElementById(method === 'card' ? 'cbtn' : 'ubtn');
    btn.disabled = true;

    // Show processing
    document.getElementById('ov').classList.add('on');

    // Simulate network delay (1.5s) then succeed
    setTimeout(function(){
      var pid = fakePid();

      // Show success screen briefly
      document.getElementById('ov').classList.remove('on');
      document.getElementById('sv').classList.add('on');
      document.getElementById('sv-id').textContent = 'Payment ID: ' + pid;

      // After 1.2s send success to React Native
      setTimeout(function(){
        rn('PAYMENT_SUCCESS', { paymentId: pid, orderId: null });
      }, 1200);

    }, 1500);
  };
})();
</script>
</body>
</html>`;
}

// ── LIVE MODE HTML ─────────────────────────────────────────────────────────────
// Opens the real Razorpay checkout — only use with a real rzp_live_ key.
function buildLiveHTML({ amount, currency = 'INR', name, description, prefill = {} }) {
    const amountPaise = Math.round(amount * 100);
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"/>
  <style>
    body{font-family:-apple-system,sans-serif;background:#f0fafa;
      display:flex;align-items:center;justify-content:center;
      height:100vh;flex-direction:column;gap:14px}
    .spin{width:48px;height:48px;border:4px solid #D0EEEE;
      border-top:4px solid #1A7A7A;border-radius:50%;
      animation:s .8s linear infinite}
    @keyframes s{to{transform:rotate(360deg)}}
    p{color:#1A7A7A;font-weight:700;font-size:15px}
  </style>
</head>
<body>
  <div class="spin"></div>
  <p>Opening payment…</p>
  <script src="https://checkout.razorpay.com/v1/checkout.js"><\/script>
  <script>
    function rn(t,d){ if(window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({type:t,data:d||{}})); }
    window.onload = function(){
      var rzp = new Razorpay({
        key: '${RAZORPAY_KEY}',
        amount: ${amountPaise},
        currency: '${currency}',
        name: ${JSON.stringify(name || 'BSGated Store')},
        description: ${JSON.stringify(description || 'Order Payment')},
        prefill: ${JSON.stringify({ email: 'user@bsgated.com', ...prefill })},
        theme: { color: '#1A7A7A' },
        handler: function(r){ rn('PAYMENT_SUCCESS',{paymentId:r.razorpay_payment_id,orderId:r.razorpay_order_id||null}); },
        modal: {
          escape: false, backdropclose: false,
          ondismiss: function(){ rn('PAYMENT_CANCELLED'); }
        }
      });
      rzp.on('payment.failed', function(r){ rn('PAYMENT_FAILED',{error:r.error.description}); });
      setTimeout(function(){ rzp.open(); }, 400);
    };
  <\/script>
</body>
</html>`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function RazorpayWebView({ visible, options = {}, onSuccess, onFailure, onDismiss }) {
    const webviewRef = useRef(null);
    const [loading, setLoading] = useState(true);

    const html = IS_TEST_MODE
        ? buildTestHTML(options)
        : buildLiveHTML(options);

    const handleMessage = (event) => {
        try {
            const { type, data } = JSON.parse(event.nativeEvent.data);
            switch (type) {
                case 'PAYMENT_SUCCESS':
                    onSuccess && onSuccess(data.paymentId, data.orderId);
                    break;
                case 'PAYMENT_CANCELLED':
                    onFailure && onFailure('Payment cancelled');
                    break;
                case 'PAYMENT_FAILED':
                    onFailure && onFailure(data.error || 'Payment failed');
                    break;
                case 'PAYMENT_ERROR':
                    onFailure && onFailure(data.error || 'Something went wrong');
                    break;
                default: break;
            }
        } catch (_) { }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onDismiss}>
            <SafeAreaView style={s.root}>

                {/* Top bar */}
                <View style={s.bar}>
                    <View>
                        <Text style={s.barTitle}>🔒 Secure Checkout</Text>
                        {IS_TEST_MODE && <Text style={s.barSub}>⚡ Test Mode</Text>}
                    </View>
                    <TouchableOpacity onPress={onDismiss} style={s.cancelBtn}>
                        <Text style={s.cancelTxt}>✕ Cancel</Text>
                    </TouchableOpacity>
                </View>

                {/* WebView */}
                <WebView
                    ref={webviewRef}
                    source={{ html }}
                    onMessage={handleMessage}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    mixedContentMode="always"
                    originWhitelist={['*']}
                    onLoadEnd={() => setLoading(false)}
                    style={{ flex: 1, backgroundColor: '#F0FAFA' }}
                />

                {loading && (
                    <View style={s.loader}>
                        <ActivityIndicator size="large" color="#1A7A7A" />
                        <Text style={s.loaderTxt}>Loading…</Text>
                    </View>
                )}

            </SafeAreaView>
        </Modal>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F0FAFA' },
    bar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#1A7A7A'
    },
    barTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
    barSub: { color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 2 },
    cancelBtn: {
        paddingHorizontal: 12, paddingVertical: 6,
        backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8
    },
    cancelTxt: { color: '#fff', fontSize: 13, fontWeight: '700' },
    loader: {
        position: 'absolute', top: 56, left: 0, right: 0, bottom: 0,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#F0FAFA', gap: 12
    },
    loaderTxt: { color: '#7A9E9E', fontSize: 14, fontWeight: '600' },
});