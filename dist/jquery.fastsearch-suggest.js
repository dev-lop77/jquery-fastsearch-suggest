(function($) {
  var defaults = {
    // Data sources
    url: null,
    // AJAX endpoint URL; query sent as ?{param}={typed}
    param: "q",
    // Query parameter name for AJAX calls
    data: null,
    // Pre-loaded string array for local filtering
    dataUrl: null,
    // URL to fetch a JSON array once at init, then filter locally
    // Behaviour
    minChars: 2,
    // Minimum characters before triggering suggestions
    maxSuggestions: 5,
    // Maximum items shown in the dropdown
    debounce: 300,
    // AJAX debounce delay in milliseconds
    matchLastWord: false,
    // When true, suggest on the last space-separated word only
    // Callbacks
    onSelect: null
    // function(value) called when user selects a suggestion
  };
  function _debounce(fn, delay) {
    var timer;
    return function() {
      var args = arguments;
      var ctx = this;
      clearTimeout(timer);
      timer = setTimeout(function() {
        fn.apply(ctx, args);
      }, delay);
    };
  }
  function _filter(arr, query) {
    var q = query.toLowerCase();
    var results = [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].toLowerCase().indexOf(q) === 0) {
        results.push(arr[i]);
      }
    }
    return results;
  }
  function _clearGhost($input) {
    $input.closest(".fss-wrapper").find(".fss-ghost").remove();
  }
  function _prefix($input, settings) {
    return settings.matchLastWord ? $input.data("fss-prefix") || "" : "";
  }
  function _showGhost($input, token, match, fullInput) {
    var suffix = match.slice(token.length);
    if (!suffix) {
      _clearGhost($input);
      return;
    }
    var $wrapper = $input.closest(".fss-wrapper");
    var $ghost = $wrapper.find(".fss-ghost");
    if (!$ghost.length) {
      $ghost = $('<span class="fss-ghost"></span>').css({
        paddingTop: parseFloat($input.css("padding-top")) + parseFloat($input.css("border-top-width")) + "px",
        paddingRight: parseFloat($input.css("padding-right")) + parseFloat($input.css("border-right-width")) + "px",
        paddingBottom: parseFloat($input.css("padding-bottom")) + parseFloat($input.css("border-bottom-width")) + "px",
        paddingLeft: parseFloat($input.css("padding-left")) + parseFloat($input.css("border-left-width")) + "px",
        fontSize: $input.css("font-size"),
        fontFamily: $input.css("font-family"),
        fontWeight: $input.css("font-weight"),
        lineHeight: $input.css("line-height")
      });
      $wrapper.prepend($ghost);
    }
    $ghost.empty().append($("<span>").text(fullInput).css("color", "transparent")).append($("<span>").text(suffix));
  }
  function _buildDropdown($input, suggestions, settings, $wrapper) {
    $wrapper.find(".fss-dropdown").remove();
    var $ul = $('<ul class="fss-dropdown"></ul>');
    suggestions.forEach(function(word) {
      var $li = $('<li class="fss-item"></li>').text(word);
      $li.on("mousedown", function(e) {
        e.preventDefault();
        var prefix = _prefix($input, settings);
        _select($input, prefix + word, settings);
      });
      $ul.append($li);
    });
    $wrapper.append($ul);
  }
  function _hideDropdown($wrapper) {
    $wrapper.find(".fss-dropdown").remove();
  }
  function _select($input, value, settings) {
    _clearGhost($input);
    $input.val(value);
    _hideDropdown($input.closest(".fss-wrapper"));
    if (typeof settings.onSelect === "function") {
      settings.onSelect(value);
    }
  }
  function _navigateDropdown($wrapper, direction) {
    var $items = $wrapper.find(".fss-item");
    var $active = $wrapper.find(".fss-item.fss-active");
    var total = $items.length;
    if (!total) {
      return;
    }
    var currentIndex = $items.index($active);
    var nextIndex;
    if (direction === "down") {
      nextIndex = (currentIndex + 1) % total;
    } else {
      nextIndex = (currentIndex - 1 + total) % total;
    }
    $items.removeClass("fss-active");
    $items.eq(nextIndex).addClass("fss-active");
  }
  function _suggest($input, suggestions, token, settings, $wrapper, fullInput) {
    _hideDropdown($wrapper);
    if (!suggestions.length) {
      _clearGhost($input);
      return;
    }
    _showGhost($input, token, suggestions[0], fullInput);
    if (suggestions.length >= 2) {
      _buildDropdown($input, suggestions.slice(0, settings.maxSuggestions), settings, $wrapper);
    }
  }
  $.fn.fastsearchSuggest = function(method, options) {
    if (method === "destroy") {
      return this.each(function() {
        var $input = $(this);
        var data = $input.data("fastsearchSuggest");
        if (!data) {
          return;
        }
        $input.off(".fss");
        $(document).off("." + data.id);
        var $wrapper = $input.closest(".fss-wrapper");
        if ($wrapper.length) {
          $wrapper.replaceWith($input);
        }
        $input.removeData("fastsearchSuggest");
      });
    }
    if (typeof method === "object" || method === void 0) {
      options = method;
    }
    var settings = $.extend({}, defaults, options);
    return this.each(function() {
      var $input = $(this);
      if ($input.data("fastsearchSuggest")) {
        return;
      }
      var instanceId = "fss-" + Date.now() + "-" + Math.floor(Math.random() * 1e3);
      var localData = null;
      var pendingInput = null;
      if (settings.data) {
        localData = settings.data;
      } else if (settings.dataUrl) {
        $.getJSON(settings.dataUrl, function(json) {
          localData = json;
          if (pendingInput) {
            var matches = _filter(localData, pendingInput.token);
            _suggest($input, matches, pendingInput.token, settings, $wrapper, pendingInput.fullInput);
            pendingInput = null;
          }
        }).fail(function() {
          pendingInput = null;
        });
      }
      var $wrapper = $('<div class="fss-wrapper"></div>');
      $input.wrap($wrapper);
      $wrapper = $input.closest(".fss-wrapper");
      $input.data("fastsearchSuggest", { id: instanceId });
      var ajaxSeq = 0;
      var ajaxSuggest = _debounce(function(token, fullInput) {
        var seq = ++ajaxSeq;
        var reqData = {};
        reqData[settings.param] = token;
        $.getJSON(settings.url, reqData, function(results) {
          if (seq !== ajaxSeq) {
            return;
          }
          _suggest($input, results, token, settings, $wrapper, fullInput);
        });
      }, settings.debounce);
      $input.on("input.fss", function() {
        var fullInput = $input.val();
        var token = fullInput;
        var prefix = "";
        if (settings.matchLastWord) {
          var lastSpace = fullInput.lastIndexOf(" ");
          if (lastSpace >= 0) {
            prefix = fullInput.slice(0, lastSpace + 1);
            token = fullInput.slice(lastSpace + 1);
          }
        }
        $input.data("fss-prefix", prefix);
        if (token.length < settings.minChars) {
          _clearGhost($input);
          _hideDropdown($wrapper);
          return;
        }
        if (localData) {
          var matches = _filter(localData, token);
          _suggest($input, matches, token, settings, $wrapper, fullInput);
        } else if (settings.dataUrl) {
          pendingInput = { token, fullInput };
        } else if (settings.url) {
          ajaxSuggest(token, fullInput);
        }
      });
      $input.on("keydown.fss", function(e) {
        var $dropdown = $wrapper.find(".fss-dropdown");
        var hasDropdown = $dropdown.length > 0;
        var ghostText = $wrapper.find(".fss-ghost").text();
        var hasGhost = ghostText.length > 0;
        switch (e.key) {
          case "Tab":
          case "ArrowRight":
            if (hasGhost && this.selectionStart === this.value.length) {
              e.preventDefault();
              _select($input, ghostText, settings);
            }
            break;
          case "ArrowDown":
            if (hasDropdown) {
              e.preventDefault();
              _navigateDropdown($wrapper, "down");
            }
            break;
          case "ArrowUp":
            if (hasDropdown) {
              e.preventDefault();
              _navigateDropdown($wrapper, "up");
            }
            break;
          case "Enter":
            if (hasDropdown) {
              var $active = $wrapper.find(".fss-item.fss-active");
              if ($active.length) {
                e.preventDefault();
                var activePrefix = _prefix($input, settings);
                _select($input, activePrefix + $active.text(), settings);
              }
            } else if (hasGhost) {
              e.preventDefault();
              _select($input, ghostText, settings);
            }
            break;
          case "Escape":
            if (hasDropdown || hasGhost) {
              e.preventDefault();
              _clearGhost($input);
              _hideDropdown($wrapper);
            }
            break;
        }
      });
      $(document).on("click." + instanceId, function(e) {
        if (!$(e.target).closest(".fss-wrapper").is($wrapper)) {
          _clearGhost($input);
          _hideDropdown($wrapper);
        }
      });
    });
  };
})(jQuery);
