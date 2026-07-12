/* $(function () {

  if (typeof _userdata !== 'undefined' && _userdata.session_logged_in !== 1) {
    $('#notiffi_button').hide();
    $('#fa-pins-button').hide();
    $('#FAM-button-open').hide();
    $('#logbook-toggle').hide();
    $('#newspaper-toggle').hide();
    $('#frqcy-toggle').hide();
    $('#rpg-panel-button').hide();
    $('#KRSN-button').hide();
  }

}); */

$(function () {
  const isLoggedIn =
    Number(window._userdata?.session_logged_in) === 1;

  if (isLoggedIn) {
    return;
  }

  const guestHiddenModules = [
    "#notiffi_button",
    "#fa-pins-button",
    "#FAM-button-open",
    "#logbook-toggle",
    "#newspaper-toggle",
    "#frqcy-toggle",
    "#rpg-panel-button",
    "#manifest-toggle",
    "#KRSN-button"
  ];

  $(guestHiddenModules.join(",")).remove();
});
