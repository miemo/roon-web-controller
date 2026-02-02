"use strict";
var socket = io();
var noSleep = new NoSleep();
var curZone;
var css = [];
var settings = [];
var state = [];
var inVolumeSlider = false;

$(document).ready(function() {
  showPage();
  fixFontSize();
  enableCoverToggle();
});

function enableCoverToggle() {
$("#containerCoverImage").on("click", function () {
    $("body").toggleClass("cover-expanded");
  });
}

function toggleCircleIcon() {
  if ($("#circleIconsSwitch").is(":checked", false)) {
    // Triggered when the unchecked toggle has been checked
    $("#circleIconsSwitch").prop("checked", true);
    settings.useCircleIcons = true;
    state = [];
  } else {
    // Triggered when the checked toggle has been unchecked
    $("#circleIconsSwitch").prop("checked", false);
    settings.useCircleIcons = false;
    state = [];
  }
  setCookie("settings['useCircleIcons']", settings.useCircleIcons);
}

function toggle4kImages() {
  if ($("#4kImagesSwitch").is(":checked", false)) {
    // Triggered when the unchecked toggle has been checked
    $("#4kImagesSwitch").prop("checked", true);
    settings.use4kImages = true;
    state = [];
  } else {
    // Triggered when the checked toggle has been unchecked
    $("#4kImagesSwitch").prop("checked", false);
    settings.use4kImages = false;
    state = [];
  }
  setCookie("settings['use4kImages']", settings.use4kImages);
}

function toggleScreensaver() {
  if ($("#screensaverSwitch").is(":checked", false)) {
    // Triggered when the unchecked toggle has been checked
    $("#screensaverSwitch").prop("checked", true);
    settings.screensaverDisable = true;
    state = [];
  } else {
    // Triggered when the checked toggle has been unchecked
    $("#screensaverSwitch").prop("checked", false);
    settings.screensaverDisable = false;
    state = [];
  }
  setCookie("settings['screensaverDisable']", settings.screensaverDisable);
}

function toggleScroll() {
  if ($("#scrollSwitch").is(":checked", false)) {
    // Triggered when the unchecked toggle has been checked
    $("#scrollSwitch").prop("checked", true);
    settings.useScroll = true;
    state = [];
  } else {
    // Triggered when the checked toggle has been unchecked
    $("#scrollSwitch").prop("checked", false);
    settings.useScroll = false;
    state = [];
  }
  setCookie("settings['useScroll']", settings.useScroll);
}


function toggleNotifications() {
  if ($("#notificationsSwitch").is(":checked", false)) {
    // Triggered when the unchecked toggle has been checked
    $("#notificationsSwitch").prop("checked", true);
    settings.showNotifications = true;
    settings.showNotificationsChanged = true;
  } else {
    // Triggered when the checked toggle has been unchecked
    $("#notificationsSwitch").prop("checked", false);
    settings.showNotifications = false;
    settings.showNotificationsChanged = true;
  }
  setCookie("settings['showNotifications']", settings.showNotifications);
}

function notifyMe(three_line) {
  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notification");
  }

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    var options = {
      body: three_line.line2 + " - " + three_line.line3,
      icon: "/roonapi/getImage?image_key=" + curZone.now_playing.image_key
    };
    var notification = new Notification(three_line.line1, options);
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== "denied") {
    Notification.requestPermission(function(permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        var options = {
          body: three_line.line2 + " - " + three_line.line3,
          icon: "/roonapi/getImage?image_key=" + curZone.now_playing.image_key
        };
        var notification = new Notification(three_line.line1, options);
      }
    });
  }

  // At last, if the user has denied notifications, and you
  // want to be respectful there is no need to bother them any more.
  console.log(notification);
}

function fixFontSize() {
  var line1Height = Math.round(parseInt($("#line1").height() * 0.8));
  $("#line1").css(
    "font-size",
    line1Height
  );
  $("#line2").css(
    "font-size",
    Math.round(line1Height * 0.75)
  );
  $("#line3").css(
    "font-size",
    Math.round(line1Height * 0.75)
  );
  
  //var zoneFontSize = Math.round(parseInt($("#containerZoneList").height() / 3));
  //if (zoneFontSize <= 20) {
  //  $("#nowplayingZoneList").css("font-size", 20);
  //} else {
  //  $("#nowplayingZoneList").css("font-size", zoneFontSize);
 // }
}

function showPage() {
  // Read settings from cookie
  settings.zoneID = readCookie("settings['zoneID']");
  settings.displayName = readCookie("settings['displayName']");
  settings.theme = readCookie("settings['theme']");

  var showNotifications = readCookie("settings['showNotifications']");
  if (showNotifications === "true") {
    settings.showNotifications = true;
    $("#notificationsSwitch").prop("checked", true);
  } else {
    settings.showNotifications = false;
    $("#notificationsSwitch").prop("checked", false);
  }

  var useCircleIcons = readCookie("settings['useCircleIcons']");
  if (useCircleIcons === "true") {
    settings.useCircleIcons = true;
    $("#circleIconsSwitch").prop("checked", true);
  } else {
    settings.useCircleIcons = false;
    $("#circleIconsSwitch").prop("checked", false);
  }

  var use4kImages = readCookie("settings['use4kImages']");
  if (use4kImages === "true") {
    settings.use4kImages = true;
    $("#4kImagesSwitch").prop("checked", true);
  } else {
    settings.use4kImages = false;
    $("#4kImagesSwitch").prop("checked", false);
  }

  var screensaverDisable = readCookie("settings['screensaverDisable']");
  if (screensaverDisable === "true") {
    settings.screensaverDisable = true;
    $("#screensaverSwitch").prop("checked", true);
  } else {
    settings.screensaverDisable = false;
    $("#screensaverSwitch").prop("checked", false);
  }

  var useScroll = readCookie("settings['useScroll']");
  if (useScroll === "false") {
    settings.useScroll = false;
    $("#scrollSwitch").prop("checked", false);
  } else {
    settings.useScroll = true;
    $("#scrollSwitch").prop("checked", true);
  }

  // Set page fields to settings
  if (settings.zoneID === undefined) {
    $("#overlayZoneList").show();
  }

  if (settings.displayName !== undefined) {
    $(".buttonZoneName").html(settings.displayName);
  }

  if (settings.theme === undefined) {
    settings.theme = "dark";
    setCookie("settings['theme']", settings.theme);
    setTheme(settings.theme);
  } else {
    setTheme(settings.theme);
  }

  // Get Buttons
  $("#buttonVolume").html(getSVG("volume"));
  $("#buttonSettings").html(getSVG("settings"));

  // Hide pages until player state is determined
  $("#notPlaying").hide();
  $("#isPlaying").hide();

  enableSockets();
}

function enableSockets() {
  socket.on("zoneList", function(payload) {
    $(".zoneList").html("");

    if (payload !== undefined) {
      var payloadids = [];
      for (var x in payload) {
        $(".zoneList").append(
          '<button type="button" class="buttonOverlay buttonZoneId" id="button-' +
            payload[x].zone_id +
            '" onclick="selectZone(\'' +
            payload[x].zone_id +
            "', '" +
            payload[x].display_name +
            "')\">" +
            payload[x].display_name +
            "</button>"
        );
        payloadids.push(payload[x].zone_id);
      }
      if (payloadids.includes(settings.zoneID) === false) {
        $("#overlayZoneList").show();
      }
    }
  });

  socket.on("zoneStatus", function(payload) {
    if (settings.zoneID !== undefined) {
      for (var x in payload) {
        if (payload[x].zone_id == settings.zoneID) {
          curZone = payload[x];
          // Set zone button to active
          $(".buttonZoneId").removeClass("buttonSettingActive");
          $("#button-" + settings.zoneID).addClass("buttonSettingActive");

          updateZone(curZone);
        } else {
          curZone = undefined;
        }
      }
    }
  });
}

function selectZone(zone_id, display_name) {
  settings.zoneID = zone_id;
  setCookie("settings['zoneID']", settings.zoneID);

  settings.displayName = display_name;
  setCookie("settings['displayName']", settings.displayName);
  $(".buttonZoneName").html(settings.displayName);

  // Set zone button to active
  $(".buttonZoneId").removeClass("buttonSettingActive");
  $("#button-" + settings.zoneID).addClass("buttonSettingActive");

  // Reset state on zone switch
  state = [];
  socket.emit("getZone", zone_id);

  $("#overlayZoneList").hide();
}

function updateZone(curZone) {
  if (curZone.now_playing) {
    showIsPlaying(curZone);
  } else {
    showNotPlaying();
  }
}

function showNotPlaying() {
  $("#notPlaying").show();
  $("#isPlaying").hide();

  // Reset icons
  $("#controlPrev")
    .html(getSVG("prev"))
    .removeClass("buttonAvailable")
    .addClass("buttonInactive");
  $("#controlPlayPauseStop")
    .html(getSVG("play"))
    .removeClass("buttonAvailable")
    .addClass("buttonInactive");
  $("#controlNext")
    .html(getSVG("next"))
    .removeClass("buttonAvailable")
    .addClass("buttonInactive");
  $("#buttonLoop")
    .html(getSVG("loop"))
    .removeClass("buttonAvailable buttonActive")
    .addClass("buttonInactive");
  $("#buttonShuffle")
    .html(getSVG("shuffle"))
    .removeClass("buttonAvailable buttonActive")
    .addClass("buttonInactive");
  $("#buttonRadio")
    .html(getSVG("radio"))
    .removeClass("buttonAvailable buttonActive")
    .addClass("buttonInactive");

  // Blank text fields
  $("#line1, #line2, #line3, #seekPosition, #seekLength").html("&nbsp;");
  $("#trackSeekValue").css("width", "0%");

  // Reset pictures
  $("#containerCoverImage").html(
    '<img src="/img/transparent.png" class="itemImage">'
  );
  $("#coverBackground").css("background-image", "url('/img/transparent.png')");

  // Turn off screensaverDisable
  noSleep.disable();

  // Reset state and browser title
  state = [];
  $(document).prop("title", "Roon Web Controller");
}

function showIsPlaying(curZone) {
  $("#notPlaying").hide();
  $("#isPlaying").show();

  if (state.line1 != curZone.now_playing.three_line.line1) {
    state.line1 = curZone.now_playing.three_line.line1;
    fixFontSize();
    $("#line1").html(state.line1);
    if (settings.useScroll) {      
      $("#line1").simplemarquee({
        cycles: Infinity,
        delayBetweenCycles: 5000,
        handleHover: false
      });
  }
  }

  if (state.line2 != curZone.now_playing.three_line.line2) {
    state.line2 = curZone.now_playing.three_line.line2;
    $("#line2").html(curZone.now_playing.three_line.line2);
    if (settings.useScroll) {
      $("#line2").simplemarquee({
        cycles: Infinity,
        delayBetweenCycles: 5000,
        handleHover: false
      });
    }
    }

  if (state.line3 != curZone.now_playing.three_line.line3) {
    state.line3 = curZone.now_playing.three_line.line3;
    $("#line3").html(curZone.now_playing.three_line.line3);
    if (settings.useScroll) {    
      $("#line3").simplemarquee({
            cycles: Infinity,
            delayBetweenCycles: 5000,
            handleHover: false
          });
      }
    }

  if (state.title != curZone.now_playing.one_line.line1) {
    state.title = curZone.now_playing.one_line.line1;
    $(document).prop("title", curZone.now_playing.one_line.line1);
    if (settings.showNotifications === true) {
      notifyMe(curZone.now_playing.three_line);
    }
  }

  if (settings.showNotificationsChanged === true) {
    if (settings.showNotifications === true) {
      notifyMe(curZone.now_playing.three_line);
    }
    settings.showNotificationsChanged = false;
  }

  if (curZone.is_seek_allowed === true) {
    $("#seekPosition").html(secondsConvert(curZone.now_playing.seek_position));
    $("#seekLength").html(secondsConvert(curZone.now_playing.length));
    $("#trackSeekValue").css(
      "width",
      Math.round(
        (curZone.now_playing.seek_position / curZone.now_playing.length) * 100
      ) + "%"
    );
  } else {
    $("#seekPosition, #seekLength").html("&nbsp;");
    $("#trackSeekValue").css("width", "0%");
  }

  if (
    state.image_key != curZone.now_playing.image_key ||
    state.image_key === undefined
  ) {
    state.image_key = curZone.now_playing.image_key;

    if (curZone.now_playing.image_key === undefined) {
      state.imgUrl = "/img/transparent.png";
    } else {
      if (settings.use4kImages === true) {
        state.imgUrl =
          "/roonapi/getImage4k?image_key=" + curZone.now_playing.image_key;
        state.CTimgUrl =
          "/roonapi/getImage?image_key=" + curZone.now_playing.image_key;
      } else {
        state.imgUrl =
          "/roonapi/getImage?image_key=" + curZone.now_playing.image_key;
        state.CTimgUrl =
          "/roonapi/getImage?image_key=" + curZone.now_playing.image_key;
      }
    }
    $("#containerCoverImage").html(
      '<img src="' +
        state.imgUrl +
        '" class="itemImage" alt="Cover art for ' +
        state.title +
        '">'
    );
    $("#coverBackground").css("background-image", "url(" + state.imgUrl + ")");

    if (settings.theme == "color") {
      var colorThief = new ColorThief();

      colorThief.getColorAsync(state.CTimgUrl, function(color) {
        var r = color[0];
        var g = color[1];
        var b = color[2];
        css.colorBackground = "rgb(" + color + ")";

        var yiq = (r * 299 + g * 587 + b * 114) / 1000;
        if (yiq >= 128) {
          css.backgroundColor = "#eff0f1";
          css.foregroundColor = "#232629";
          css.trackSeek = "rgba(35, 38, 41, 0.33)";
        } else {
          css.backgroundColor = "#232629";
          css.foregroundColor = "#eff0f1";
          css.trackSeek = "rgba(239, 240, 241, 0.15)";
        }
        $("#colorBackground").show();
        showTheme("color");
      });
    }
  }

  if (state.Prev != curZone.is_previous_allowed || state.Prev === undefined) {
    state.Prev = curZone.is_previous_allowed;
    if (curZone.is_previous_allowed === true) {
      $("#controlPrev")
        .attr("onclick", "goCmd('prev', '" + curZone.zone_id + "')")
        .attr("aria-disabled", false)
        .html(getSVG("prev"))
        .addClass("buttonAvailable")
        .removeClass("buttonInactive");
    } else {
      $("#controlPrev")
        .attr("onclick", "")
        .attr("aria-disabled", true)
        .html(getSVG("prev"))
        .addClass("buttonInactive")
        .removeClass("buttonAvailable");
    }
  }

  if (state.Next != curZone.is_next_allowed || state.Next === undefined) {
    state.Next = curZone.is_next_allowed;
    if (curZone.is_next_allowed === true) {
      $("#controlNext")
        .attr("onclick", "goCmd('next', '" + curZone.zone_id + "')")
        .attr("aria-disabled", false)
        .html(getSVG("next"))
        .addClass("buttonAvailable")
        .removeClass("buttonInactive");
    } else {
      $("#controlNext")
        .attr("onclick", "")
        .attr("aria-disabled", true)
        .html(getSVG("next"))
        .addClass("buttonInactive")
        .removeClass("buttonAvailable");
    }
  }

  if (curZone.is_play_allowed === true) {
    state.PlayPauseStop = "showPlay";
    noSleep.disable();
  } else if (curZone.state == "playing" && curZone.is_play_allowed === false) {
    if (curZone.is_pause_allowed === true) {
      state.PlayPauseStop = "showPause";
      if (settings.screensaverDisable === true) {
        noSleep.enable();
      } else {
        noSleep.disable();
      }
    } else {
      state.PlayPauseStop = "showStop";
      if (settings.screensaverDisable === true) {
        noSleep.enable();
      } else {
        noSleep.disable();
      }
    }
  } else {
    state.PlayPauseStop = "showPlayDisabled";
    noSleep.disable();
  }

  if (
    state.PlayPauseStopLast != state.PlayPauseStop ||
    state.PlayPauseStop === undefined
  ) {
    state.PlayPauseStopLast = state.PlayPauseStop;
    if (state.PlayPauseStop == "showPlay") {
      $("#controlPlayPauseStop")
        .attr("onclick", "goCmd('play', '" + curZone.zone_id + "')")
        .attr("aria-disabled", false)
        .html(getSVG("play"))
        .addClass("buttonAvailable")
        .removeClass("buttonInactive");
    } else if (state.PlayPauseStop == "showPause") {
      $("#controlPlayPauseStop")
        .attr("onclick", "goCmd('pause', '" + curZone.zone_id + "')")
        .attr("aria-disabled", false)
        .html(getSVG("pause"))
        .addClass("buttonAvailable")
        .removeClass("buttonInactive");
    } else if (state.PlayPauseStop == "showStop") {
      $("#controlPlayPauseStop")
        .attr("onclick", "goCmd('stop', '" + curZone.zone_id + "')")
        .attr("aria-disabled", false)
        .html(getSVG("stop"))
        .addClass("buttonAvailable")
        .removeClass("buttonInactive");
    } else if (state.PlayPauseStop == "showPlayDisabled") {
      $("#controlPlayPauseStop")
        .html(getSVG("play"))
        .attr("onclick", "")
        .attr("aria-disabled", true)
        .addClass("buttonInactive")
        .removeClass("buttonAvailable");
    }
  }

  if (state.Loop != curZone.settings.loop || state.Loop === undefined) {
    state.Loop = curZone.settings.loop;
    if (state.Loop == "disabled") {
      $("#buttonLoop")
        .html(getSVG("loop"))
        .attr(
          "onclick",
          "changeZoneSetting('loop', 'loop', '" + curZone.zone_id + "')"
        )
        .attr("name", "Loop off")
        .attr("aria-label", "Loop off")
        .attr("aria-disabled", false)
        .removeClass("buttonActive buttonInactive")
        .addClass("buttonAvailable")
        .css("color", css.foregroundColor);
    } else if (state.Loop == "loop_one") {
      $("#buttonLoop")
        .html(getSVG("loopOne"))
        .attr(
          "onclick",
          "changeZoneSetting('loop', 'disabled', '" + curZone.zone_id + "')"
        )
        .attr("name", "Loop one")
        .attr("aria-label", "Loop one")
        .attr("aria-disabled", false)
        .removeClass("buttonAvailable buttonInactive")
        .addClass("buttonActive")
        .css("color", "#7578ff");
    } else if (state.Loop == "loop") {
      $("#buttonLoop")
        .html(getSVG("loop"))
        .attr(
          "onclick",
          "changeZoneSetting('loop', 'loop_one', '" + curZone.zone_id + "')"
        )
        .attr("name", "Loop all")
        .attr("aria-label", "Loop all")
        .attr("aria-disabled", false)
        .removeClass("buttonAvailable buttonInactive")
        .addClass("buttonActive")
        .css("color", "#7578ff");
    } else {
      $("#buttonLoop")
        .html(getSVG("loop"))
        .attr("onclick", "")
        .attr("name", "Loop disabled")
        .attr("aria-label", "Loop disabled")
        .attr("aria-disabled", true)
        .removeClass("buttonAvailable buttonActive")
        .addClass("buttonInactive")
        .css("color", css.foregroundColor);
    }
  }

  if (
    state.Shuffle != curZone.settings.shuffle ||
    state.Shuffle === undefined
  ) {
    state.Shuffle = curZone.settings.shuffle;
    if (state.Shuffle === false) {
      $("#buttonShuffle")
        .html(getSVG("shuffle"))
        .attr(
          "onclick",
          "changeZoneSetting('shuffle', 'true', '" + curZone.zone_id + "')"
        )
        .attr("name", "Shuffle off")
        .attr("aria-label", "Shuffle off")
        .attr("aria-disabled", false)
        .removeClass("buttonActive buttonInactive")
        .addClass("buttonAvailable")
        .css("color", css.foregroundColor);
    } else if (state.Shuffle === true) {
      $("#buttonShuffle")
        .html(getSVG("shuffle"))
        .attr(
          "onclick",
          "changeZoneSetting('shuffle', 'false', '" + curZone.zone_id + "')"
        )
        .attr("name", "Shuffle on")
        .attr("aria-label", "Shuffle on")
        .attr("aria-disabled", false)
        .removeClass("buttonAvailable buttonInactive")
        .addClass("buttonActive")
        .css("color", "#7578ff");
    } else {
      $("#buttonShuffle")
        .html(getSVG("shuffle"))
        .attr("onclick", "")
        .attr("name", "Shuffle disabled")
        .attr("aria-label", "Shuffle disabled")
        .attr("aria-disabled", true)
        .removeClass("buttonAvailable buttonActive")
        .addClass("buttonInactive")
        .css("color", css.foregroundColor);
    }
  }

  if (state.Radio != curZone.settings.auto_radio || state.Radio === undefined) {
    state.Radio = curZone.settings.auto_radio;
    if (state.Radio === false) {
      $("#buttonRadio")
        .html(getSVG("radio"))
        .attr(
          "onclick",
          "changeZoneSetting('auto_radio', 'true', '" + curZone.zone_id + "')"
        )
        .attr("name", "Roon Radio off")
        .attr("aria-label", "Roon Radio off")
        .attr("aria-disabled", false)
        .removeClass("buttonActive buttonInactive")
        .addClass("buttonAvailable")
        .css("color", css.foregroundColor);
    } else if (state.Radio === true) {
      $("#buttonRadio")
        .html(getSVG("radio"))
        .attr(
          "onclick",
          "changeZoneSetting('auto_radio', 'false', '" + curZone.zone_id + "')"
        )
        .attr("name", "Roon Radio on")
        .attr("aria-label", "Roon Radio on")
        .attr("aria-disabled", false)
        .removeClass("buttonAvailable buttonInactive")
        .addClass("buttonActive")
        .css("color", "#7578ff");
    } else {
      $("#buttonRadio")
        .html(getSVG("radio"))
        .attr("onclick", "")
        .attr("name", "Roon Radio disabled")
        .attr("aria-label", "Roon Radio disabled")
        .attr("aria-disabled", true)
        .removeClass("buttonAvailable buttonActive")
        .addClass("buttonInactive")
        .css("color", css.foregroundColor);
    }
  }

  if (inVolumeSlider === false) {
    $("#volumeList").html("");
    for (var x in curZone.outputs) {
      if (x >= 1) {
        $("#volumeList").append("<hr>");
      }
      if (curZone.outputs[x].volume) {
        var html =
          '<div class="textBold">' + curZone.outputs[x].display_name + "</div>";
        html += "<div>" + curZone.outputs[x].volume.value + "</div>";

        html += '<div class="volumeGroup">';
        html += '<button type="button" class="buttonFillHeight volumeButton"';
        html +=
          "onclick=\"volumeButton('volumeValue" +
          x +
          "', " +
          (curZone.outputs[x].volume.value - curZone.outputs[x].volume.step) +
          ", '" +
          curZone.outputs[x].output_id +
          "')\"";
        html += 'name="Volume down"';
        html += 'aria-label="Volume down"';
        html += ">" + getSVG("volume-minus") + "</button>";
        html += '<div class="volumeSlider">';
        html +=
          '<input type="range" min="' +
          curZone.outputs[x].volume.min +
          '"  max="' +
          curZone.outputs[x].volume.max +
          '" step="' +
          curZone.outputs[x].volume.step +
          '" value="' +
          curZone.outputs[x].volume.value +
          '" oninput="volumeInput(\'volumeValue' +
          x +
          "', this.value, '" +
          curZone.outputs[x].output_id +
          "')\" onchange=\"volumeChange('volumeValue" +
          x +
          "', this.value, '" +
          curZone.outputs[x].output_id +
          "')\">";
        html += "</div>";
        html += '<button type="button" class="buttonFillHeight volumeButton"';
        html +=
          "onclick=\"volumeButton('volumeValue" +
          x +
          "', " +
          (curZone.outputs[x].volume.value + curZone.outputs[x].volume.step) +
          ", '" +
          curZone.outputs[x].output_id +
          "')\"";
        html += 'name="Volume up"';
        html += 'aria-label="Volume up"';
        html += ">" + getSVG("volume-plus") + "</button>";
        html += "</div>";

        $("#volumeList").append(html);
      } else {
        $("#volumeList")
          .append(
            '<div class="textBold">' +
              curZone.outputs[x].display_name +
              "</div>"
          )
          .append("<div>Fixed Volume</div>");
      }
    }
  }

  if (state.themeShowing === undefined) {
    state.themeShowing = true;
    showTheme(settings.theme);
  }
}

function goCmd(cmd, zone_id) {
  if (cmd == "prev") {
    socket.emit("goPrev", zone_id);
  } else if (cmd == "next") {
    socket.emit("goNext", zone_id);
  } else if (cmd == "play") {
    socket.emit("goPlay", zone_id);
  } else if (cmd == "pause") {
    socket.emit("goPause", zone_id);
  } else if (cmd == "stop") {
    socket.emit("goStop", zone_id);
  }
}

function changeZoneSetting(zoneSetting, zoneSettingValue, zone_id) {
  //		 for (x in curZone.outputs){
  var msg = JSON.parse(
    '{"zone_id": "' +
      zone_id +
      '", "setting": "' +
      zoneSetting +
      '", "value": "' +
      zoneSettingValue +
      '" }'
  );
  socket.emit("changeSetting", msg);
  //		 }
}

function volumeButton(spanId, value, output_id) {
  $("#" + spanId + "").html(value);

  var msg = JSON.parse(
    '{"output_id": "' + output_id + '", "volume": "' + value + '" }'
  );
  socket.emit("changeVolume", msg);
}

function volumeInput(spanId, value, output_id) {
  inVolumeSlider = true;
  $("#" + spanId + "").html(value);

  var msg = JSON.parse(
    '{"output_id": "' + output_id + '", "volume": "' + value + '" }'
  );
  socket.emit("changeVolume", msg);
}

function volumeChange(id, value, output_id) {
  inVolumeSlider = false;
}

function setTheme(theme) {
  settings.theme = theme;
  state.themeShowing = undefined;
  setCookie("settings['theme']", theme);

  if (theme == "dark" || theme === undefined) {
    css.backgroundColor = "#232629";
    css.foregroundColor = "#eff0f1";
    css.trackSeek = "rgba(239, 240, 241, 0.15)";

    $("#coverBackground").hide();
    $("#colorBackground").hide();
    $("#buttonThemeDark").addClass("buttonSettingActive");
    $("#buttonThemeColor, #buttonThemeCover").removeClass(
      "buttonSettingActive"
    );
  } else if (theme == "cover") {
    css.backgroundColor = "#232629";
    css.foregroundColor = "#eff0f1";
    css.trackSeek = "rgba(239, 240, 241, 0.15)";

    $("#coverBackground").show();
    $("#colorBackground").hide();
    $("#buttonThemeCover").addClass("buttonSettingActive");
    $("#buttonThemeColor, #buttonThemeDark").removeClass("buttonSettingActive");
  } else if (theme == "color") {
    state.image_key = undefined;
    $("#coverBackground").hide();
    $("#colorBackground").show();
    $("#buttonThemeColor").addClass("buttonSettingActive");
    $("#buttonThemeDark, #buttonThemeCover").removeClass("buttonSettingActive");
  } else {
    settings.theme = undefined;
    setTheme(settings.theme);
  }
  state = [];
  socket.emit("getZone", true);
}

function showTheme(theme) {
  $("body")
    .css("background-color", css.backgroundColor)
    .css("color", css.foregroundColor);
  $(".colorChange").css("color", css.foregroundColor);
  $("#colorBackground").css("background-color", css.colorBackground);
  $(".buttonAvailable").css("color", css.foregroundColor);
  $(".buttonInactive").css("color", css.foregroundColor);
  $("#trackSeek").css("background-color", css.trackSeek);
  socket.emit("getZone", true);
}

function readCookie(name) {
  return Cookies.get(name);
}

function setCookie(name, value) {
  Cookies.set(name, value, { expires: 365 });
}

function secondsConvert(seconds) {
  seconds = Number(seconds);
  var hour = Math.floor(seconds / 3600);
  var minute = Math.floor((seconds % 3600) / 60);
  var second = Math.floor((seconds % 3600) % 60);
  return (
    (hour > 0 ? hour + ":" + (minute < 10 ? "0" : "") : "") +
    minute +
    ":" +
    (second < 10 ? "0" : "") +
    second
  );
}

function getSVG(cmd) {
  if (settings.useCircleIcons === true) {
    switch (cmd) {
      case "play":
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="largeIcon"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 13.5v-7a.5.5 0 0 1 .8-.4l4.67 3.5c.27.2.27.6 0 .8l-4.67 3.5a.5.5 0 0 1-.8-.4z"/></svg>';
      case "pause":
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="largeIcon"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14c-.55 0-1-.45-1-1V9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1zm4 0c-.55 0-1-.45-1-1V9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1z"/></svg>';
      case "stop":
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="largeIcon"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3 14H9c-.55 0-1-.45-1-1V9c0-.55.45-1 1-1h6c.55 0 1 .45 1 1v6c0 .55-.45 1-1 1z"/></svg>';
      default:
        break;
    }
  } else {
    switch (cmd) {
      case "play":
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="largeIcon"><path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18a1 1 0 0 0 0-1.69L9.54 5.98A.998.998 0 0 0 8 6.82z"/></svg>';
      case "pause":
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="largeIcon"><path d="M8 19c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2v10c0 1.1.9 2 2 2zm6-12v10c0 1.1.9 2 2 2s2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2z"/></svg>';
      case "stop":
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="largeIcon"><path d="M8 6h8c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2z"/></svg>';
      default:
        break;
    }
  }

  switch (cmd) {
    case "loop":
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="smallIcon"><path d="M7 7h10v1.79c0 .45.54.67.85.35l2.79-2.79c.2-.2.2-.51 0-.71l-2.79-2.79a.5.5 0 0 0-.85.36V5H6c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1s1-.45 1-1V7zm10 10H7v-1.79c0-.45-.54-.67-.85-.35l-2.79 2.79c-.2.2-.2.51 0 .71l2.79 2.79a.5.5 0 0 0 .85-.36V19h11c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1s-1 .45-1 1v3z"/></svg>';
    case "loopOne":
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="smallIcon"><path d="M7 7h10v1.79c0 .45.54.67.85.35l2.79-2.79c.2-.2.2-.51 0-.71l-2.79-2.79a.5.5 0 0 0-.85.36V5H6c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1s1-.45 1-1V7zm10 10H7v-1.79c0-.45-.54-.67-.85-.35l-2.79 2.79c-.2.2-.2.51 0 .71l2.79 2.79a.5.5 0 0 0 .85-.36V19h11c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1s-1 .45-1 1v3zm-4-2.75V9.81c0-.45-.36-.81-.81-.81a.74.74 0 0 0-.36.09l-1.49.74a.61.61 0 0 0-.34.55c0 .34.28.62.62.62h.88v3.25c0 .41.34.75.75.75s.75-.34.75-.75z"/></svg>';
    case "shuffle":
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="smallIcon"><path d="M10.59 9.17 6.12 4.7a.996.996 0 1 0-1.41 1.41l4.46 4.46 1.42-1.4zm4.76-4.32 1.19 1.19L4.7 17.88a.996.996 0 1 0 1.41 1.41L17.96 7.46l1.19 1.19a.5.5 0 0 0 .85-.36V4.5c0-.28-.22-.5-.5-.5h-3.79a.5.5 0 0 0-.36.85zm-.52 8.56-1.41 1.41 3.13 3.13-1.2 1.2a.5.5 0 0 0 .36.85h3.79c.28 0 .5-.22.5-.5v-3.79c0-.45-.54-.67-.85-.35l-1.19 1.19-3.13-3.14z"/></svg>';
    case "radio":
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="smallIcon"><path d="M3.24 6.15C2.51 6.43 2 7.17 2 8v12c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2V8c0-1.1-.9-2-2-2H8.3l7.43-3c.46-.19.68-.71.49-1.17a.894.894 0 0 0-1.17-.49L3.24 6.15zM7 20c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm13-8h-2v-1c0-.55-.45-1-1-1s-1 .45-1 1v1H4V9c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v3z"/></svg>';
    case "prev":
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="largeIcon"><path d="M7 6c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1s-1-.45-1-1V7c0-.55.45-1 1-1zm3.66 6.82 5.77 4.07c.66.47 1.58-.01 1.58-.82V7.93c0-.81-.91-1.28-1.58-.82l-5.77 4.07a1 1 0 0 0 0 1.64z"/></svg>';
    case "next":
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="largeIcon"><path d="m7.58 16.89 5.77-4.07c.56-.4.56-1.24 0-1.63L7.58 7.11C6.91 6.65 6 7.12 6 7.93v8.14c0 .81.91 1.28 1.58.82zM16 7v10c0 .55.45 1 1 1s1-.45 1-1V7c0-.55-.45-1-1-1s-1 .45-1 1z"/></svg>';
    case "volume":
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="smallIcon"><path d="M3 10v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71V6.41c0-.89-1.08-1.34-1.71-.71L7 9H4c-.55 0-1 .45-1 1zm13.5 2A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 4.45v.2c0 .38.25.71.6.85C17.18 6.53 19 9.06 19 12s-1.82 5.47-4.4 6.5c-.36.14-.6.47-.6.85v.2c0 .63.63 1.07 1.21.85C18.6 19.11 21 15.84 21 12s-2.4-7.11-5.79-8.4c-.58-.23-1.21.22-1.21.85z"/></svg>';
    case "volume-minus":
      return '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M18.5 12A4.5 4.5 0 0 0 16 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 10v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71V6.41c0-.89-1.08-1.34-1.71-.71L9 9H6c-.55 0-1 .45-1 1z"/></svg>';
    case "volume-plus":
      return '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M3 10v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71V6.41c0-.89-1.08-1.34-1.71-.71L7 9H4c-.55 0-1 .45-1 1zm13.5 2A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 4.45v.2c0 .38.25.71.6.85C17.18 6.53 19 9.06 19 12s-1.82 5.47-4.4 6.5c-.36.14-.6.47-.6.85v.2c0 .63.63 1.07 1.21.85C18.6 19.11 21 15.84 21 12s-2.4-7.11-5.79-8.4c-.58-.23-1.21.22-1.21.85z"/></svg>';
    case "settings":
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="smallIcon"><path fill="none" d="M0 0h24v24H0z"/><path d="M19.5 12c0-.23-.01-.45-.03-.68l1.86-1.41c.4-.3.51-.86.26-1.3l-1.87-3.23a.987.987 0 0 0-1.25-.42l-2.15.91c-.37-.26-.76-.49-1.17-.68l-.29-2.31c-.06-.5-.49-.88-.99-.88h-3.73c-.51 0-.94.38-1 .88l-.29 2.31c-.41.19-.8.42-1.17.68l-2.15-.91c-.46-.2-1-.02-1.25.42L2.41 8.62c-.25.44-.14.99.26 1.3l1.86 1.41a7.343 7.343 0 0 0 0 1.35l-1.86 1.41c-.4.3-.51.86-.26 1.3l1.87 3.23c.25.44.79.62 1.25.42l2.15-.91c.37.26.76.49 1.17.68l.29 2.31c.06.5.49.88.99.88h3.73c.5 0 .93-.38.99-.88l.29-2.31c.41-.19.8-.42 1.17-.68l2.15.91c.46.2 1 .02 1.25-.42l1.87-3.23c.25-.44.14-.99-.26-1.3l-1.86-1.41c.03-.23.04-.45.04-.68zm-7.46 3.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>';
    default:
      break;
  }
}
