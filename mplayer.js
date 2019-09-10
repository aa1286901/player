"use strict";
(function ($) {
    jQuery.fn.mplayer = function (options) {
        options = $.extend({
            volume: 50,
            playlist: [],
            autostart: false,
        }, options);

        var make = function () {
            var $this = $(this);
            var cpl = 0;
            var $audio = new Audio();
            // setTimeout addEventListener('ended'
            //mnpl.js:99 Uncaught (in promise) DOMException: The play() request was interrupted by a new load request.init_track @ mnpl.js:99(anonymous function) @ mnpl.js:72
            var endedRun = false;
            $this.find('.mplayer__volume-slider').slider({
                animate: true,
                range: 'min',
                value: options.volume,
                min: 0,
                max: 1,
                step: 0.01,
                slide: function (event, ui) {
                    $audio.volume = ui.value;
                }
            });

            $this.find('.mplayer__long-slider').slider({
                animate: true,
                range: 'min',
                value: 0,
                min: 0,
                max: 60,
                step: 1,
                slide: function (event, ui) {
                    if (ui.value < Math.floor($audio.duration)) {
                        $audio.currentTime = ui.value;
                    } else {
                        $audio.currentTime = ui.value - 1;
                    }
                    $this.find('.mplayer__playlist-body span').eq(cpl).addClass('mplayer__playlist-current');
                },
            });

            $audio.addEventListener('canplay', function (_event) {
                if ($audio.duration) {
                    $this.find('.mplayer__all-time').html(toMinit($audio.duration));
                    $this.find('.mplayer__long-slider').slider({'max': $audio.duration});
                } else {
                    $this.find('.mplayer__all-time').html(toMinit(options.playlist[cpl].duration));
                    $this.find('.mplayer__long-slider').slider({'max': options.playlist[cpl].duration});
                }
                if (options.autostart) {
                    $audio.play();
                    $this.find('.mplayer__pause').addClass('isplay');
                } else {
                    options.autostart = true;
                }
            });

            $audio.addEventListener('ended', function () {
                if (!endedRun) {
                    endedRun = true;
                    setTimeout(function () {
                        if ($this.find('.mplayer__repeat-on')[0]) {
                            init_track(cpl);
                        } else {
                            if ($this.find('.mplayer__random-on')[0]) {
                                $this.find('.mplayer__playlist-body span').eq(cpl).removeClass('mplayer__playlist-current');
                                for (var prevTrack = cpl; ( prevTrack === cpl ) && ( options.playlist.length > 1 ); cpl = Math.floor(Math.random() * options.playlist.length));
                                init_track(cpl);
                            } else {
                                if (cpl == options.playlist.length - 1) {
                                    cpl = -1;
                                }
                                init_track(cpl + 1);
                            }
                        }
                    }, 500);
                    endedRun = false;
                }
            });

            $audio.addEventListener('timeupdate', function () {
                $this.find('.mplayer__long-slider').slider({'value': $audio.currentTime});
                $this.find('.mplayer__current-time').html(toMinit($audio.currentTime));
            });

            function toMinit(val) {
                val = Number(val);
                var ost = Math.floor(val % 60);
                if (ost < 10) {
                    ost = '0' + ost;
                }
                return Math.floor(val / 60) + ':' + ost;
            }

            function init_track(i) {
                $this.find('.mplayer__playlist-body span').eq(cpl).removeClass('mplayer__playlist-current');
                cpl = i;
                $this.find('.mplayer__playlist-body span').eq(i).addClass('mplayer__playlist-current');

                // load audio track
                $audio.src = options.playlist[i].pfile;

                // front track name
                $this.find('.mplayer__front-title-track').html(options.playlist[i].title);
                $this.find('.mplayer__front-title-author').html(options.playlist[i].author);

                // front bg
                $this.find('.mplayer__front-header-next-bg').css('background-image', 'url("' + options.playlist[i].background + '")');
                $this.find('.mplayer__front-header-current-bg').stop().animate({'opacity': 0}, 500, function () {
                    $(this).css('backgroundImage', 'url(' + options.playlist[i].background + ')');
                    $(this).css('opacity', '1');
                });

                //playlist bg
                $this.find('.mplayer__playlist-body-next-bg').css('background-image', 'url("' + options.playlist[i].background + '")');
                $this.find('.mplayer__playlist-body-current-bg').stop().animate({'opacity': 0}, 500, function () {
                    $(this).css('backgroundImage', 'url(' + options.playlist[i].background + ')');
                    $(this).css('opacity', '1');
                });

                // front cover
                $this.find('.mplayer__cover-art-next').attr('src', options.playlist[i].cover);
                $this.find('.mplayer__cover-art-current').stop().animate({'opacity': 0}, 500, function () {
                    $(this).attr('src', options.playlist[i].cover);
                    $(this).css('opacity', '1');
                });
            }

            init_track(cpl);
            for (var i = 0; i < options.playlist.length; i++) {
                var trackDuration = Math.floor(options.playlist[i].duration / 60) + ':';
                if (Math.floor(options.playlist[i].duration % 60) < 10) {
                    trackDuration += '0' + options.playlist[i].duration % 60;
                } else {
                    trackDuration += options.playlist[i].duration % 60;
                }
                $this.find('.mplayer__playlist-body-inner').append(
                    '<span>'
                    + options.playlist[i].author
                    + ' - '
                    + options.playlist[i].title
                    + '<time>'
                    + trackDuration
                    + '</time>'
                    + '</span>'
                );
            }

            $this.find('.mplayer__playlist-body span').on('click',function () {

                init_track($(this).index('.mplayer__playlist-body span'));
            });

            $this.find('.mplayer__prev').on('click',function () {
                $this.find('.mplayer__playlist-body span').eq(cpl).removeClass('mplayer__playlist-current');
                if ($this.find('.mplayer__random-on')[0]) {
                    for (var prevTrack = cpl; ( prevTrack === cpl ) && ( options.playlist.length > 1 ); cpl = Math.floor(Math.random() * options.playlist.length));
                    init_track(cpl);
                } else {
                    if (cpl == 0) {
                        cpl = options.playlist.length;
                    }
                    init_track(cpl - 1);
                }
                return false;
            });

            $this.find('.mplayer__pause').on('click',function () {
                if ($audio.paused) {
                    $audio.play();
                    $(this).addClass('isplay');
                    $this.find('.mplayer__playlist-body span').eq(cpl).addClass('mplayer__playlist-current');
                } else {
                    $audio.pause();
                    $(this).removeClass('isplay');
                    $this.find('.mplayer__playlist-body span').eq(cpl).removeClass('mplayer__playlist-current');
                }
                return false;
            });

            $this.find('.mplayer__next').on('click',function () {
                $this.find('.mplayer__playlist-body span').eq(cpl).removeClass('mplayer__playlist-current');
                if ($this.find('.mplayer__random-on')[0]) {
                    for (var prevTrack = cpl; ( prevTrack === cpl ) && ( options.playlist.length > 1 ); cpl = Math.floor(Math.random() * options.playlist.length));
                    init_track(cpl);
                } else {
                    if (cpl == options.playlist.length - 1) {
                        cpl = -1;
                    }
                    init_track(cpl + 1);
                }
                return false;
            });
        };
        return this.each(make);
    };

    $(document).ready(function () {
        $('.mplayer__playlist').css('display', 'none');
        $('.mplayer__playlist-btn-front').on('click',function () {
            $('.mplayer__playlist').fadeToggle();
        });
        $('.mplayer__front-btn-playlist').on('click',function () {
            $('.mplayer__playlist').fadeToggle();
            changeSize(); //perfectScrollbar
        });
        $('.mplayer__random').on('click',function () {
            $('.mplayer__random').toggleClass("mplayer__random-on");
        });
        $('.mplayer__repeat').on('click',function () {
            $('.mplayer__repeat').toggleClass("mplayer__repeat-on");
        });

        // perfectScrollbar

        function changeSize() {
            var width = parseInt($(".js-perfect-scrollbar").val());
            var height = parseInt($(".js-perfect-scrollbar").val());

            $(".js-perfect-scrollbar").width(width).height(height);

            // update scrollbars
            $('.js-perfect-scrollbar').perfectScrollbar('update');


        }
        $('.js-perfect-scrollbar').perfectScrollbar();

        // END perfectScrollbar
    });
})(jQuery);