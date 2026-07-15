const STYLES = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0} html,body{height:100%;overflow:hidden}
:root{--bg:#080c0a;--surface:#0f1410;--card:#161c17;--border:#232d24;--accent:#c8f135;--accent-dim:rgba(200,241,53,0.1);--accent-glow:rgba(200,241,53,0.25);--text:#e8f0e9;--muted:#4a5e4b;--protein:#4ade80;--carbs:#60a5fa;--fat:#fb923c;--danger:#ff6b6b}
.app{background:var(--bg);height:100vh;display:flex;flex-direction:column;font-family:'Syne',sans-serif;color:var(--text);max-width:960px;margin:0 auto;overflow:hidden}
.header{padding:18px 16px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.logo{font-size:19px;font-weight:800;letter-spacing:-0.5px} .logo span{color:var(--accent)}
.icon-btn{background:none;border:none;color:var(--muted);cursor:pointer;font-size:20px;padding:4px;line-height:1;transition:color 0.2s} .icon-btn:hover{color:var(--text)}
.summary{margin:12px;background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:16px}
.cal-row{display:flex;align-items:baseline;gap:8px;margin-bottom:14px}
.cal-num{font-family:'Space Mono',monospace;font-size:44px;font-weight:700;color:var(--accent);line-height:1;transition:color .2s}.cal-num.over{color:var(--danger)}
.cal-sub{font-size:13px;color:var(--muted)} .cal-target{font-family:'Space Mono',monospace;font-size:13px;color:var(--muted)}
.cal-progress-wrap{margin-bottom:14px}
.cal-progress{position:relative;width:100%;height:8px;background:var(--card);border-radius:4px}
.cal-progress-fill{height:100%;border-radius:4px;background:var(--accent);transition:width .4s ease,background .2s}.cal-progress-fill.over{background:var(--danger)}
.cal-progress-caption{display:flex;justify-content:space-between;margin-top:4px;font:10px 'Space Mono',monospace;color:var(--muted)}
.macro-bars{display:flex;flex-direction:column;gap:9px}
.mbar-row{display:flex;align-items:center;gap:10px}
.mbar-label{font-size:10px;color:var(--muted);width:46px;text-transform:uppercase;letter-spacing:0.7px}
.mbar-bg{position:relative;flex:1;height:5px;background:#2a3a2b;border-radius:3px}
.mbar-fill{height:100%;border-radius:3px;transition:width 0.4s ease}
.goal-marker{position:absolute;z-index:2;top:-4px;width:2px;height:13px;transform:translateX(-1px);border-radius:1px;background:var(--text);box-shadow:0 0 0 1px rgba(8,12,10,.65)}
.goal-marker::before{content:'';position:absolute;top:-2px;left:-2px;width:6px;height:3px;border-radius:2px;background:var(--text)}
.calorie-goal-marker{top:-3px;height:14px}
.mbar-val{font-family:'Space Mono',monospace;font-size:10px;color:var(--text);width:70px;text-align:right}
.deficit{display:flex;justify-content:space-between;margin-top:13px;padding-top:13px;border-top:1px solid var(--border);font-family:'Space Mono',monospace;font-size:11px}
.tabs{display:flex;padding:0 12px;border-bottom:1px solid var(--border)}
.tab{flex:1;padding:11px 4px;border:none;background:none;color:var(--muted);font-family:'Syne',sans-serif;font-size:12px;font-weight:700;cursor:pointer;border-bottom:2px solid transparent;transition:all 0.2s;letter-spacing:0.3px}
.tab.active{color:var(--accent);border-bottom-color:var(--accent)}
.content{padding:12px;padding-bottom:90px;flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch}
.sec-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;margin-top:6px}
.sec-title{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--muted)}
.log-entry{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:11px 14px;margin-bottom:7px;display:flex;align-items:center;justify-content:space-between}
.entry-name{font-size:14px;font-weight:700;margin-bottom:2px} .entry-macros{font-size:10px;color:var(--muted);font-family:'Space Mono',monospace}
.entry-cal{font-family:'Space Mono',monospace;font-size:17px;font-weight:700;color:var(--accent)}
.meal-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:7px;cursor:pointer;transition:border-color 0.2s,background 0.2s;display:flex;align-items:center;justify-content:space-between}
.meal-card:hover{border-color:var(--accent);background:var(--card)}
.meal-card-name{font-size:15px;font-weight:700;margin-bottom:4px} .meal-card-macros{font-size:10px;color:var(--muted);font-family:'Space Mono',monospace}
.meal-card-cal{font-family:'Space Mono',monospace;font-size:18px;font-weight:700;color:var(--accent);white-space:nowrap}
.fab{position:fixed;bottom:22px;right:max(20px,calc((100vw - 960px)/2 + 20px));width:54px;height:54px;border-radius:50%;background:var(--accent);color:#000;border:none;font-size:26px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 24px var(--accent-glow);font-weight:700;transition:transform 0.2s;z-index:100;line-height:1}
.fab:hover{transform:scale(1.06)}
.btn{padding:11px 20px;border-radius:9px;border:none;font-family:'Syne',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all 0.2s}
.btn-primary{background:var(--accent);color:#000} .btn-primary:hover{opacity:0.88} .btn-primary:disabled{opacity:0.4;cursor:not-allowed}
.btn-ghost{background:transparent;color:var(--muted);border:1px solid var(--border)} .btn-ghost:hover{border-color:var(--text);color:var(--text)}
.btn-sm{padding:6px 14px;font-size:12px;border-radius:7px}
.overlay{position:fixed;top:0;bottom:0;left:50%;width:min(100%,960px);transform:translateX(-50%);background:rgba(0,0,0,0.82);backdrop-filter:blur(5px);z-index:200;display:flex;align-items:flex-end;padding:12px}
.modal{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:20px;width:100%;max-height:88vh;overflow-y:auto;animation:up 0.22s ease}
@keyframes up{from{transform:translateY(36px);opacity:0}to{transform:translateY(0);opacity:1}}
.confirm-overlay{align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,.78)}
.confirm-modal{width:min(100%,360px);max-height:none;overflow:visible;background:#050705;border:1px solid var(--accent);border-radius:18px;padding:22px;box-shadow:0 18px 60px rgba(0,0,0,.7),0 0 30px rgba(200,241,53,.12);animation:confirm-in .18s ease}
.confirm-title{color:#fff;margin-bottom:10px;justify-content:flex-start}
.confirm-copy{color:#fff;font-size:13px;line-height:1.6}
.confirm-name{color:var(--accent);font-weight:800}
.confirm-cancel{background:#050705;color:#fff;border:1px solid rgba(255,255,255,.5)}
.confirm-cancel:hover{border-color:#fff;color:#fff}
.confirm-delete{background:var(--accent);color:#000;border:1px solid var(--accent)}
.confirm-delete:hover{filter:brightness(.92)}
@keyframes confirm-in{from{transform:scale(.94);opacity:0}to{transform:scale(1);opacity:1}}
.modal-title{font-size:17px;font-weight:800;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between}
.lbl{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:0.6px;margin-bottom:5px;display:block}
.inp{width:100%;background:var(--card);border:1px solid var(--border);border-radius:9px;padding:10px 13px;color:var(--text);font-family:'Syne',sans-serif;font-size:16px;outline:none;transition:border-color 0.2s;margin-bottom:12px}
.inp:focus{border-color:var(--accent)} .inp::placeholder{color:var(--muted)}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.modal-actions{display:flex;gap:8px;margin-top:16px} .modal-actions .btn{flex:1}
.empty{text-align:center;padding:44px 20px;color:var(--muted)} .empty-icon{font-size:34px;margin-bottom:10px} .empty-text{font-size:13px;line-height:1.5}
.empty-action{width:56px;height:56px;padding:0;border:1px solid var(--border);border-radius:50%;background:var(--surface);color:var(--muted);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:color .18s,border-color .18s,background .18s,transform .18s}
.empty-action:hover,.empty-action:focus-visible{color:var(--accent);border-color:var(--accent);background:var(--card);transform:scale(1.05);outline:none}
.camera-overlay{position:fixed;top:0;bottom:0;left:50%;width:min(100%,960px);transform:translateX(-50%);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.72);backdrop-filter:blur(5px)}
.camera-window{position:relative;width:min(100%,600px);overflow:hidden;background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:14px;box-shadow:0 22px 70px rgba(0,0,0,.75),0 0 28px rgba(200,241,53,.08)}
.camera-close{position:absolute;top:22px;right:22px;z-index:3;width:34px;height:34px;border-radius:50%;background:rgba(0,0,0,.62);color:#fff;font-size:20px}
.camera-stage{position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;background:#050505;border-radius:13px}
.camera-stage video{display:block;width:100%;height:100%;object-fit:cover}
.scan-frame{position:absolute;left:9%;right:9%;top:50%;height:38%;transform:translateY(-50%);border:2px solid rgba(255,255,255,.62);border-radius:12px;box-shadow:0 0 0 999px rgba(0,0,0,.3);transition:border-color .18s,box-shadow .18s}
.scan-frame.detected{border-color:#facc15;box-shadow:0 0 0 999px rgba(0,0,0,.25),0 0 28px rgba(250,204,21,.35)}
.scan-frame.captured,.scan-frame.success{border-color:var(--accent);box-shadow:0 0 0 999px rgba(0,0,0,.25),0 0 30px var(--accent-glow)}
.scan-frame.rejected{border-color:var(--danger);box-shadow:0 0 0 999px rgba(0,0,0,.35),0 0 28px rgba(255,107,107,.28)}
.scan-line{position:absolute;left:8%;right:8%;top:50%;height:2px;background:var(--accent);box-shadow:0 0 10px var(--accent);animation:scanMove 1.6s ease-in-out infinite}
@keyframes scanMove{0%,100%{transform:translateY(-55px);opacity:.45}50%{transform:translateY(55px);opacity:1}}
.camera-message{min-height:46px;padding:13px 14px 2px;color:rgba(255,255,255,.72);font-size:13px;font-family:'Syne',sans-serif;text-align:center;line-height:1.5}
.camera-message.detected{color:#facc15}.camera-message.captured{color:var(--accent)}
.camera-error{color:var(--danger)}
.camera-code{margin-top:4px;font-family:'Space Mono',monospace;color:#fff}
.camera-correction{padding:8px 14px 4px}
.camera-correction-row{display:flex;gap:8px;align-items:center}
.camera-correction-row .inp{margin:0;flex:1;font-family:'Space Mono',monospace}
.camera-scan-again{display:block;width:100%;margin-top:8px}
.barcode-status{border-radius:8px;padding:8px 12px;margin-bottom:12px;font-size:12px;line-height:1.45}
.barcode-status.loading{background:var(--card);border:1px solid var(--border);color:var(--muted);text-align:center}
.barcode-status.success{background:var(--accent-dim);border:1px solid rgba(200,241,53,.3);color:var(--accent)}
.barcode-status.warning{background:rgba(250,204,21,.08);border:1px solid rgba(250,204,21,.38);color:#facc15}
.barcode-status.error{background:rgba(255,107,107,.1);border:1px solid rgba(255,107,107,.3);color:var(--danger)}
.barcode-missing,.barcode-available{margin-top:4px;color:var(--text);font-family:'Space Mono',monospace;font-size:10px}
.inp.incomplete-field{border-color:#facc15;background:rgba(250,204,21,.06)}
.form-alert{background:var(--accent-dim);border:1px solid rgba(200,241,53,.32);border-radius:9px;padding:10px 12px;margin:10px 0 2px;font-size:12px;color:var(--text);line-height:1.45}
.toggle-group{display:flex;background:var(--card);border-radius:9px;padding:3px;margin-bottom:14px}
.toggle{flex:1;padding:8px;border:none;background:none;border-radius:7px;font-family:'Syne',sans-serif;font-size:12px;font-weight:700;color:var(--muted);cursor:pointer;transition:all 0.18s}
.toggle.active{background:var(--surface);color:var(--text)}
.history-screen{min-height:100%}
.history-summary{height:238px;padding:14px 16px 8px;overflow:hidden}
.history-summary .history-chart-card{padding:0;background:transparent;border:0;border-radius:0}
.history-summary .history-chart{max-width:720px;margin:0 auto}
.history-list-heading{margin-bottom:10px}
.history-toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:2px 0 12px}
.history-view-switch{display:flex;padding:3px;background:var(--card);border:1px solid var(--border);border-radius:10px}
.history-view-button{min-width:76px;padding:7px 12px;border:0;border-radius:7px;background:transparent;color:var(--muted);font:700 11px 'Syne',sans-serif;cursor:pointer;transition:background .18s,color .18s}
.history-view-button.active{background:var(--surface);color:var(--accent);box-shadow:0 1px 5px rgba(0,0,0,.24)}
.history-view-button:focus-visible,.history-chart-day:focus{outline:2px solid var(--accent);outline-offset:2px}
.history-chart-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:15px 14px 10px;overflow:hidden}
.history-legend{display:flex;align-items:center;justify-content:center;gap:18px;flex-wrap:wrap;color:var(--muted);font:700 10px 'Space Mono',monospace}
.history-legend span{display:inline-flex;align-items:center;gap:6px}
.history-legend i{display:block;width:18px;height:3px;border-radius:2px}
.history-legend .legend-bar{height:9px;background:var(--accent);opacity:.72}.history-legend .legend-over{background:var(--danger);opacity:.9}
.history-chart-hint{text-align:center;margin:9px 0 2px;color:var(--muted);font-size:11px}
.history-chart-scroll{overflow-x:auto;overscroll-behavior-inline:contain}
.history-chart{display:block;width:100%;min-width:610px;height:auto;font-family:'Space Mono',monospace}
.history-grid-line{stroke:var(--border);stroke-width:1;vector-effect:non-scaling-stroke}
.history-goal-line{stroke-width:1.5;stroke-dasharray:6 5;opacity:.72;vector-effect:non-scaling-stroke}
.history-goal-label{fill:var(--text);stroke:var(--surface);stroke-width:4px;paint-order:stroke;font-size:9px;font-weight:700}
.history-axis-label,.history-axis-title,.history-date-label{fill:var(--muted);font-size:11px}
.history-axis-title{font-size:10px;text-transform:uppercase}
.history-date-label.today{fill:var(--accent);font-weight:700}
.history-calorie-bar{opacity:.55;transition:opacity .18s}.history-calorie-normal{fill:var(--accent)}.history-calorie-excess{fill:var(--danger);opacity:.92}.today .history-calorie-normal{opacity:.82}.today .history-calorie-excess{opacity:1}
.history-macro-line{fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}
.history-macro-point{stroke:var(--surface);stroke-width:2;vector-effect:non-scaling-stroke}
.history-chart-day{cursor:pointer}
.history-day-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:14px;margin-bottom:10px;cursor:pointer;transition:border-color .2s}
.history-day-card:hover,.history-day-card.editing{border-color:var(--accent)}
.history-day-heading{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:8px}
.history-day-date{font-weight:800;font-size:14px}
.history-day-calories{display:flex;align-items:center;gap:10px}
.history-day-calories>span{font:700 16px 'Space Mono',monospace;color:var(--accent);white-space:nowrap}
.history-day-calories>span.over,.history-day-macros .over{color:var(--danger)}
.history-day-calories small{font-size:10px;color:var(--muted)}
.history-day-close{font-size:13px}
.history-progress{width:100%;height:6px;background:var(--card);border-radius:3px;overflow:hidden;margin-bottom:8px}
.history-progress>div{height:100%;border-radius:3px;background:var(--accent);transition:width .4s}
.history-progress>div.over{background:var(--danger)}
.history-day-macros{display:flex;justify-content:space-between;gap:8px;font:10px 'Space Mono',monospace;color:var(--muted);margin-bottom:10px}
.history-day-macros b{font-weight:400}.history-day-macros .protein{color:var(--protein)}.history-day-macros .carbs{color:var(--carbs)}.history-day-macros .fat{color:var(--fat)}.history-day-macros .balance{color:var(--accent)}
.history-food-row{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-top:1px solid var(--border);font-size:12px;color:var(--text)}
.history-food-row>div{display:flex;align-items:center;gap:8px}.history-food-row b{font:400 11px 'Space Mono',monospace;color:var(--accent)}
.editable-history-entry{cursor:pointer;padding-left:6px;border-radius:6px;transition:background .15s}.editable-history-entry:hover{background:var(--card)}
.history-no-entries{padding:10px 0;border-top:1px solid var(--border);color:var(--muted);font-size:11px;text-align:center}
.history-add-food{margin-top:12px;width:100%}
.ing-chip{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:8px 12px;margin-bottom:6px;display:flex;align-items:center;justify-content:space-between;font-size:12px}
.ing-result{padding:10px 12px;border-radius:8px;cursor:pointer;font-size:13px;transition:background 0.15s;color:var(--text)} .ing-result:hover{background:var(--card)}
.ing-list{max-height:160px;overflow-y:auto;border:1px solid var(--border);border-radius:9px;margin-bottom:12px}
.preview{background:var(--accent-dim);border:1px solid rgba(200,241,53,0.18);border-radius:10px;padding:10px 14px;margin-bottom:12px;font-family:'Space Mono',monospace;font-size:11px;display:flex;justify-content:space-between}
.del-btn{background:none;border:none;color:var(--muted);cursor:pointer;font-size:15px;padding:2px 6px;line-height:1;transition:color 0.2s} .del-btn:hover{color:var(--danger)}
.editable-entry{cursor:pointer;transition:border-color .2s,background .2s}.editable-entry:hover{border-color:var(--accent);background:var(--card)}
.serving-row{background:var(--card);border-radius:10px;padding:10px 14px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between}
.serving-inp{width:70px;background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:6px 8px;color:var(--text);font-family:'Space Mono',monospace;font-size:16px;text-align:right;outline:none}
.serving-inp:focus{border-color:var(--accent)}
.serving-modal{width:min(100%,420px);max-height:none;overflow:visible;animation:confirm-in .18s ease}
.serving-meal-name{font-size:15px;font-weight:700;margin-bottom:14px;overflow-wrap:anywhere}
.serving-field{display:flex;align-items:center;gap:8px;color:var(--muted);font-family:'Space Mono',monospace}
.field-error{color:var(--danger);font-size:11px;margin:-3px 0 10px}
.history-date-modal{width:min(100%,420px);max-height:none;overflow:visible;animation:confirm-in .18s ease}
.history-date-error{margin-top:-5px}
.tag{display:inline-flex;align-items:center;background:var(--card);border:1px solid var(--border);border-radius:6px;padding:3px 9px;font-size:10px;font-family:'Space Mono',monospace;color:var(--muted);margin-right:5px;margin-bottom:4px}
.toast{position:fixed;top:18px;left:50%;transform:translateX(-50%);padding:8px 18px;border-radius:20px;font-family:'Space Mono',monospace;font-size:11px;font-weight:700;z-index:999;pointer-events:none;animation:toast-in 0.2s ease;white-space:nowrap}
.toast-ok{background:var(--accent);color:#000} .toast-err{background:var(--danger);color:#fff}
@keyframes toast-in{from{opacity:0;top:8px}to{opacity:1;top:18px}}
.auth-wrap{min-height:100vh;background:var(--bg);display:flex;align-items:center;justify-content:center;padding:24px;font-family:'Syne',sans-serif;color:var(--text)}
.auth-box{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:28px;width:100%;max-width:380px}
.auth-logo{margin-bottom:6px} .auth-sub{font-size:13px;color:var(--muted);margin-bottom:24px}
@media (max-width:430px){
  .app{height:100dvh;max-width:none}
  .header{padding:calc(14px + env(safe-area-inset-top)) 12px 11px}
  .logo{font-size:18px}
  .summary{margin:9px 10px;padding:13px;border-radius:14px}
  .cal-row{margin-bottom:12px;gap:6px}
  .cal-num{font-size:38px}
  .cal-sub,.cal-target{font-size:11px}
  .macro-bars{gap:8px}
  .mbar-row{gap:7px}
  .mbar-label{width:42px;font-size:9px}
  .mbar-val{width:62px;font-size:9px}
  .deficit{margin-top:11px;padding-top:11px;font-size:10px}
  .tabs{padding:0 8px}
  .tab{padding:10px 2px;font-size:11px;letter-spacing:0}
  .content{padding:9px 10px calc(78px + env(safe-area-inset-bottom))}
  .sec-hdr{margin-top:4px}
  .log-entry{padding:10px 11px;gap:8px}
  .entry-name{font-size:13px;overflow-wrap:anywhere}
  .entry-macros{font-size:9px;line-height:1.5}
  .entry-cal{font-size:15px}
  .meal-card{padding:11px;gap:10px}
  .meal-card-name{font-size:14px;overflow-wrap:anywhere}
  .meal-card-cal{font-size:16px}
  .fab{right:14px;bottom:calc(14px + env(safe-area-inset-bottom));width:50px;height:50px;font-size:24px}
  .overlay{width:100%;padding:8px max(8px,env(safe-area-inset-right)) calc(8px + env(safe-area-inset-bottom)) max(8px,env(safe-area-inset-left))}
  .modal{padding:16px;border-radius:16px;max-height:calc(100dvh - 16px)}
  .modal-title{font-size:16px;margin-bottom:13px}
  .modal-actions{margin-top:13px}
  .btn{padding:10px 14px;font-size:13px}
  .btn-sm{padding:6px 10px;font-size:11px}
  .grid2{gap:6px}
  .inp{padding:9px 11px;margin-bottom:10px}
  .toggle-group{margin-bottom:11px}
  .toggle{padding:7px 3px;font-size:10px}
  .history-toolbar{margin-bottom:9px}
  .history-summary{height:211px;padding:10px 8px 5px}
  .history-view-button{min-width:64px;padding:6px 9px;font-size:10px}
  .history-chart-card{padding:12px 8px 7px;border-radius:14px}
  .history-legend{gap:8px 12px;font-size:9px}
  .history-chart-hint{font-size:10px}
  .history-chart{min-width:560px}
  .history-day-card{padding:12px 11px}
  .history-day-heading{align-items:flex-start;gap:8px}
  .history-day-date{font-size:13px}
  .history-day-calories>span{font-size:14px}
  .history-day-macros{font-size:9px;gap:5px}
  .preview{padding:9px 10px;gap:7px 12px;flex-wrap:wrap;justify-content:flex-start}
  .serving-row{padding:9px 11px}
  .confirm-overlay{padding:18px}
  .confirm-modal{width:min(100%,340px);padding:20px}
  .camera-overlay{padding:10px}
  .camera-window{width:100%;padding:10px;border-radius:16px}
  .camera-close{top:17px;right:17px}
  .scan-frame{left:7%;right:7%;height:40%}
  .camera-message{font-size:12px;padding:11px 10px 1px}
  .toast{top:calc(10px + env(safe-area-inset-top));max-width:calc(100% - 24px);overflow:hidden;text-overflow:ellipsis}
  .auth-wrap{min-height:100dvh;padding:18px}
  .auth-box{padding:22px 18px;border-radius:16px}
}
@media (max-width:350px){
  .grid2{grid-template-columns:1fr}
  .cal-num{font-size:34px}
  .tab{font-size:10px}
}`;

export default STYLES;
