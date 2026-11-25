/* 余白。起動時の表示設定反映（端末内の localStorage のみを読む。外部送信なし） */
(function () {
  var root = document.documentElement;
  var s = null;
  try {
    var raw = window.localStorage.getItem('yohaku.settings.v1');
    if (raw) s = JSON.parse(raw);
  } catch (e) {
    s = null;
  }
  s = s || {};
  var theme = s.theme === 'light' || s.theme === 'dark' ? s.theme : 'system';
  var font = ['s', 'm', 'l', 'xl'].indexOf(s.fontSize) >= 0 ? s.fontSize : 'm';
  var mode = ['minimal', 'standard', 'full'].indexOf(s.mode) >= 0 ? s.mode : 'standard';
  var reduce = false;
  try {
    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}
  var motion = s.reduceMotion === true || (s.reduceMotion !== false && reduce) ? 'reduce' : 'full';
  root.setAttribute('data-theme', theme);
  root.setAttribute('data-font', font);
  root.setAttribute('data-mode', mode);
  root.setAttribute('data-motion', motion);
})();
