
var wooFile = true;
//Functions WOO

(function ($) {
	"use strict";

	var wromoxTheme = {
		popupEffect: 'mfp-move-horizontal',
		supports_html5_storage: false,
		shopLoadMoreBtn: '.wromox-products-load-more.load-on-scroll',
		ajaxLinks: '.wromox-product-categories a, .widget_product_categories a, .widget_layered_nav_filters a, .woocommerce-widget-layered-nav a, .filters-area:not(.custom-content) a, body.post-type-archive-product:not(.woocommerce-account) .woocommerce-pagination a, body.tax-product_cat:not(.woocommerce-account) .woocommerce-pagination a, .wromox-shop-tools a, .wromox-woocommerce-layered-nav a, .wromox-price-filter a, .wromox-clear-filters-wrapp a, .wromox-woocommerce-sort-by a, .woocommerce-widget-layered-nav-list a, .wd-widget-stock-status a',
		mainCarouselArg: {
			rtl: $('body').hasClass('rtl'),
			items: wromox_settings.product_gallery.thumbs_slider.position == 'centered' ? 2 : 1,
			autoplay: wromox_settings.product_slider_autoplay,
			autoplayTimeout: 3000,
			loop: wromox_settings.product_slider_autoplay,
			center: wromox_settings.product_gallery.thumbs_slider.position == 'centered',
			startPosition: wromox_settings.product_gallery.thumbs_slider.position == 'centered' ? wromox_settings.centered_gallery_start : 0,
			dots: false,
			nav: true,
			autoHeight: wromox_settings.product_slider_auto_height == 'yes',
			navText: false,
			onRefreshed: function () {
				$(window).resize();
			}
		}
	};

	/* Storage Handling */
	try {
		wromoxTheme.supports_html5_storage = ('sessionStorage' in window && window.sessionStorage !== null);

		window.sessionStorage.setItem('wromox', 'test');
		window.sessionStorage.removeItem('wromox');
	} catch (err) {
		wromoxTheme.supports_html5_storage = false;
	}

	wromoxThemeModule.categoriesDropdowns = function () {
		$( '.dropdown_product_cat' ).change( function() {
			if ($(this).val() != '') {
				var this_page = '';
				var home_url  = wromox_settings.home_url;
				if ( home_url.indexOf( '?' ) > 0 ) {
					this_page = home_url + '&product_cat=' + jQuery(this).val();
				} else {
					this_page = home_url + '?product_cat=' + jQuery(this).val();
				}
				location.href = this_page;
			} else {
				location.href = wromox_settings.shop_url;
			}
		});

		$('.widget_product_categories').each(function () {
			var $select = $(this).find('select');

			if ($().selectWoo) {
				$select.selectWoo({
					minimumResultsForSearch: 5,
					width: '100%',
					allowClear: true,
					placeholder: wromox_settings.product_categories_placeholder,
					language: {
						noResults: function () {
							return wromox_settings.product_categories_no_results;
						}
					}
				});
			}
		});
	};

	/**
	 * Mini cart quantity
	 */
	wromoxThemeModule.miniCartQuantity = function () {
		var timeout;

		$(document).on('change input', '.woocommerce-mini-cart .quantity .qty', function() {
			var input = $(this);
			var qtyVal = input.val();
			var itemID = input.parents('.woocommerce-mini-cart-item').data('key');
			var cart_hash_key = wromox_settings.cart_hash_key;
			var fragment_name = wromox_settings.fragment_name;

			clearTimeout(timeout);

			timeout = setTimeout(function () {
				input.parents('.mini_cart_item').addClass('wd-loading');

				$.ajax({
					url: wromox_settings.ajaxurl,
					data: {
						action: 'wromox_update_cart_item',
						item_id: itemID,
						qty: qtyVal
					},
					success: function (data) {
						if ( data && data.fragments ) {
							$.each( data.fragments, function( key, value ) {
								if ($(key).hasClass('widget_shopping_cart_content')) {
									var dataItemValue = $(value).find('.woocommerce-mini-cart-item[data-key="' + itemID + '"]');
									var dataFooterValue = $(value).find('.shopping-cart-widget-footer')
									var $itemSelector = $( key ).find('.woocommerce-mini-cart-item[data-key="' + itemID + '"]');

									if (!data.cart_hash) {
										$( key ).replaceWith( value );
									} else {
										$itemSelector.replaceWith(dataItemValue);
										$('.shopping-cart-widget-footer').replaceWith( dataFooterValue );
									}
								} else {
									$( key ).replaceWith( value );
								}
							});

							if ( wromoxTheme.supports_html5_storage ) {
								sessionStorage.setItem( fragment_name, JSON.stringify( data.fragments ) );
								localStorage.setItem( cart_hash_key, data.cart_hash );
								sessionStorage.setItem( cart_hash_key, data.cart_hash );

								if ( data.cart_hash ) {
									sessionStorage.setItem( 'wc_cart_created', ( new Date() ).getTime() );
								}
							}
						}
					},
					dataType: 'json',
					method: 'GET',
				});
			}, 500);
		});
	};

	/**
	 * Swatches limit.
	 */
	wromoxThemeModule.swatchesLimit = function () {
		$('.wd-swatches-divider').on('click', function(){
			$(this).parent().find('.wromox-swatch').removeClass('wd-hidden');
			$(this).parent().addClass('wd-all-shown');
		});
	};

	/**
	 * Grid quantity
	 */
	wromoxThemeModule.gridQuantity = function () {
		$('.product-grid-item').on('change input', '.quantity .qty', function() {
			var add_to_cart_button = $(this).parent().parent().find('.add_to_cart_button');
			// For AJAX add-to-cart actions.
			add_to_cart_button.attr('data-quantity', $(this).val());
			// For non-AJAX add-to-cart actions.
			add_to_cart_button.attr('href', '?add-to-cart=' + add_to_cart_button.attr("data-product_id") + '&quantity=' + $(this).val());
		});
	};

	/**
	 * Wc tabs
	 */
	wromoxThemeModule.wcTabsHoverFix = function () {
		$('.wc-tabs > li').on('click', function () {
			wromoxThemeModule.productHover();
		});
	};

	/**
	 * Comment image
	 */
	wromoxThemeModule.commentImage = function () {
		// This is a dirty method, but there is no hook in WordPress to add attributes to the commenting form.
		$( 'form.comment-form' ).attr( 'enctype', 'multipart/form-data' );
	};

	/**
	 * Comment images upload validation
	 */
	wromoxThemeModule.commentImagesUploadValidation = function () {
		var $form = $('.comment-form');
		var $input = $form.find('#wd-add-img-btn');
		var allowedMimes = [];

		if ( $input.length === 0 ) {
			return;
		}

		$.each(wromox_settings.comment_images_upload_mimes, function(index, value) {
			allowedMimes.push(String(value));
		});

		$form.find('#wd-add-img-btn').on('change', function(e) {
			$form.find('.wd-add-img-count').text(wromox_settings.comment_images_added_count_text.replace('%s', this.files.length));
		});

		$form.on('submit', function(e) {
			$form.find('.woocommerce-error').remove();

			var hasLarge = false;
			var hasNotAllowedMime = false;

			if ($input[0].files.length > wromox_settings.comment_images_count) {
				showError(wromox_settings.comment_images_count_text);
				e.preventDefault();
			}

			Array.prototype.forEach.call($input[0].files, function(file) {
				var size = file.size;
				var type = String(file.type);

				if (size > wromox_settings.comment_images_upload_size) {
					hasLarge = true;
				}

				if ($.inArray(type, allowedMimes) < 0) {
					hasNotAllowedMime = true;
				}
			});

			if (hasLarge) {
				showError(wromox_settings.comment_images_upload_size_text);
				e.preventDefault();
			}

			if (hasNotAllowedMime) {
				showError(wromox_settings.comment_images_upload_mimes_text);
				e.preventDefault();
			}
		});

		function showError(text) {
			$form.prepend('<ul class="woocommerce-error" role="alert"><li>' + text + '</li></ul>');
		}
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Single page tabs fix with comments not in tabs
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */
	wromoxThemeModule.singleProductTabsCommentsFix = function () {
		var url   = window.location.href;
		var hash  = window.location.hash;
		var $tabs = $( 'body' ).find( '.wc-tabs, ul.tabs' ).first();

		if ( ! $('.single-product-page').hasClass('reviews-location-separate') ) {
			return;
		}
		if ( hash.toLowerCase().indexOf( 'comment-' ) >= 0 || hash === '#reviews' || hash === '#tab-reviews' ) {
			$tabs.find( 'li:first a' ).click();
		} else if ( url.indexOf( 'comment-page-' ) > 0 || url.indexOf( 'cpage=' ) > 0 ) {
			$tabs.find( 'li:first a' ).click();
		}
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Single page accordion/tabs
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */
	jQuery(window).on('elementor/frontend/init', function() {
		if (!elementorFrontend.isEditMode()) {
			return;
		}

		jQuery(window).on('resize', function(){
			wromoxThemeModule.singleProductTabsAccordion();
		});
	});

	wromoxThemeModule.singleProductTabsAccordion = function () {
		if ( $(window).width() > 1024 || $('.woocommerce-tabs').length <= 0 ) {
			return;
		}

        $('.woocommerce-tabs').removeClass('tabs-layout-tabs').addClass('tabs-layout-accordion');
        $('.single-product-page').removeClass('tabs-type-tabs').addClass('tabs-type-accordion');
	};

	/**
	*------------------------------------------------------ -------------------------------------------------------------------------------------
	* Wishlist
	*-------------------------------------------------------------------------------------------------------------------------------------------
	*/
	wromoxThemeModule.wishlist = function () {
		var cookiesName = 'wromox_wishlist_count';

		if ($('body').hasClass('logged-in')) {
			cookiesName += '_logged';
		}

		if (wromox_settings.is_multisite) {
			cookiesName += '_' + wromox_settings.current_blog_id;
		}

		var $widget = $('.wromox-wishlist-info-widget');
		var cookie = Cookies.get(cookiesName);

		if ($widget.length > 0 && 'undefined' !== typeof cookie) {
			try {
				var count = JSON.parse(cookie);
				$widget.find('.wishlist-count').text(count);
			}
			catch (e) {
				console.log('cant parse cookies json');
			}
		}

		// Add to wishlist action
		$('body').on('click', '.wromox-wishlist-btn a', function (e) {
			var $this = $(this);
			var productId = $this.data('product-id');
			var addedText = $this.data('added-text');
			var key = $this.data('key');

			if ($this.hasClass('added')) {
				return true;
			}

			e.preventDefault();

			$this.addClass('loading');

			$.ajax({
				url: wromox_settings.ajaxurl,
				data: {
					action: 'wromox_add_to_wishlist',
					product_id: productId,
					key: key,
				},
				dataType: 'json',
				method: 'GET',
				success: function (response) {
					if (response) {
						$this.addClass('added');
						$(document).trigger('added_to_wishlist');

						if (response.wishlist_content) {
							updateWishlist(response);
						}

						if ($this.find('span').length > 0) {
							$this.find('span').text(addedText);
						}
						else {
							$this.text(addedText);
						}
					}
					else {
						console.log('something wrong loading wishlist data ',
							response);
					}
				},
				error: function (data) {
					console.log(
						'We cant add to wishlist. Something wrong with AJAX response. Probably some PHP conflict.');
				},
				complete: function () {
					$this.removeClass('loading');
				},
			});

		});

		$('body').on('click', '.wromox-wishlist-remove', function (e) {
			var $this = $(this);
			var productId = $this.data('product-id');
			var key = $this.data('key');

			if ($this.hasClass('added')) {
				return true;
			}

			e.preventDefault();

			$this.addClass('loading');

			$.ajax({
				url: wromox_settings.ajaxurl,
				data: {
					action: 'wromox_remove_from_wishlist',
					product_id: productId,
					key: key,
				},
				dataType: 'json',
				method: 'GET',
				success: function (response) {
					if (response.wishlist_content) {
						updateWishlist(response);
					}
					else {
						console.log('something wrong loading wishlist data ',
							response);
					}
				},
				error: function (data) {
					console.log(
						'We cant remove from wishlist. Something wrong with AJAX response. Probably some PHP conflict.');
				},
				complete: function () {
					$this.removeClass('loading');
				},
			});

		});

		// Elements update after ajax
		function updateWishlist(data) {
			if ($widget.length > 0) {
				$widget.find('.wishlist-count').text(data.count);
			}

			if ($('.wromox-wishlist-content').length > 0 && !$('.wromox-wishlist-content').hasClass('wromox-wishlist-preview')) {
				$('.wromox-wishlist-content').replaceWith(data.wishlist_content);
			}

			wromoxThemeModule.swatchesVariations();
			wromoxThemeModule.btnsToolTips();
			wromoxThemeModule.productHover();
			wromoxThemeModule.countDownTimer();
			wromoxThemeModule.productMoreDescription();
			wromoxThemeModule.gridQuantity();
		}

	};

	/**
	*-------------------------------------------------------------------------------------------------------------------------------------------
	* Variations price
	*-------------------------------------------------------------------------------------------------------------------------------------------
	*/

	wromoxThemeModule.variationsPrice = function () {
		if ('no' === wromox_settings.single_product_variations_price) {
			return;
		}

		$('.variations_form').each(function () {
			var $form = $(this);
			var $price = $form.parent().find('> .price').first();
			var priceOriginalHtml = $price.html();

			$form.on('show_variation', function (e, variation, purchasable) {
				if (variation.price_html.length > 1) {
					$price.html(variation.price_html);
				}
			});

			$form.on('hide_variation', function () {
				$price.html(priceOriginalHtml);
			});
		});
	};

	/**
	*-------------------------------------------------------------------------------------------------------------------------------------------
	* Product filters
	*-------------------------------------------------------------------------------------------------------------------------------------------
	*/

	wromoxThemeModule.productFilters = function () {
		//Select checkboxes value
		var removeValue = function ($mainInput, currentVal) {
			if ($mainInput.length == 0) return;
			var mainInputVal = $mainInput.val();
			if (mainInputVal.indexOf(',') > 0) {
				$mainInput.val(mainInputVal.replace(',' + currentVal, '').replace(currentVal + ',', ''));
			} else {
				$mainInput.val(mainInputVal.replace(currentVal, ''));
			}
		}

		$('.wromox-pf-checkboxes li > .pf-value').on('click', function (e) {
			e.preventDefault();
			var $this = $(this);
			var $li = $this.parent();
			var $widget = $this.parents('.wromox-pf-checkboxes');
			var $mainInput = $widget.find('.result-input');
			var $results = $widget.find('.wromox-pf-results');

			var multiSelect = $widget.hasClass('multi_select');
			var mainInputVal = $mainInput.val();
			var currentText = $this.data('title');
			var currentVal = $this.data('val');

			if (multiSelect) {
				if (!$li.hasClass('pf-active')) {
					if (mainInputVal == '') {
						$mainInput.val(currentVal);
					} else {
						$mainInput.val(mainInputVal + ',' + currentVal);
					}
					$results.prepend('<li class="selected-value" data-title="' + currentVal + '">' + currentText + '</li>');
					$li.addClass('pf-active');
				} else {
					removeValue($mainInput, currentVal);
					$results.find('li[data-title="' + currentVal + '"]').remove();
					$li.removeClass('pf-active');
				}
			} else {
				if (!$li.hasClass('pf-active')) {
					$mainInput.val(currentVal);
					$results.find('.selected-value').remove();
					$results.prepend('<li class="selected-value" data-title="' + currentVal + '">' + currentText + '</li>');
					$li.parents('.wromox-scroll-content').find('.pf-active').removeClass('pf-active');
					$li.addClass('pf-active');
				} else {
					$mainInput.val('');
					$results.find('.selected-value').remove();
					$li.removeClass('pf-active');
				}
			}
		});

		//Label clear
		$('.wromox-pf-checkboxes').on('click', '.selected-value', function () {
			var $this = $(this);
			var $widget = $this.parents('.wromox-pf-checkboxes');
			var $mainInput = $widget.find('.result-input');
			var currentVal = $this.data('title');

			//Price filter clear
			if (currentVal == 'price-filter') {
				var min = $this.data('min');
				var max = $this.data('max');
				var $slider = $widget.find('.price_slider_widget');
				$slider.slider('values', 0, min);
				$slider.slider('values', 1, max);
				$widget.find('.min_price').val('');
				$widget.find('.max_price').val('');
				$(document.body).trigger('filter_price_slider_slide', [min, max, min, max, $slider]);
				return;
			}

			removeValue($mainInput, currentVal);
			$widget.find('.pf-value[data-val="' + currentVal + '"]').parent().removeClass('pf-active');
			$this.remove();
		});

		//Checkboxes value dropdown
		$('.wromox-pf-checkboxes').each(function () {
			var $this = $(this);
			var $btn = $this.find('.wromox-pf-title');
			var $list = $btn.siblings('.wromox-pf-dropdown');
			var multiSelect = $this.hasClass('multi_select');

			$btn.on('click', function (e) {
				var target = e.target;
				if ($(target).is($btn.find('.selected-value'))) return;

				if (!$this.hasClass('opened')) {
					$this.addClass('opened');
					$list.slideDown(100);
					setTimeout(function () {
						wromoxThemeModule.nanoScroller();
					}, 300);
				} else {
					close();
				}
			});

			$(document).on('click', function (e) {
				var target = e.target;
				if ($this.hasClass('opened') && (multiSelect && !$(target).is($this) && !$(target).parents().is($this)) || (!multiSelect && !$(target).is($btn) && !$(target).parents().is($btn))) {
					close();
				}
			});

			var close = function () {
				$this.removeClass('opened');
				$list.slideUp(100);
			}
		});

		var removeEmptyValues = function ($selector) {
			$selector.find('.wromox-pf-checkboxes').each(function () {
				if (!$(this).find('input[type="hidden"]').val()) {
					$(this).find('input[type="hidden"]').remove();
				}
			});
		}

		var changeFormAction = function ($form) {
			var activeCat = $form.find('.wromox-pf-categories .pf-active .pf-value');
			if (activeCat.length > 0) {
				$form.attr('action', activeCat.attr('href'));
			}
		}

		//Price slider init
		$(document.body).on('filter_price_slider_create filter_price_slider_slide', function (event, min, max, minPrice, maxPrice, $slider) {
			var minHtml = accounting.formatMoney(min, {
				symbol: woocommerce_price_slider_params.currency_format_symbol,
				decimal: woocommerce_price_slider_params.currency_format_decimal_sep,
				thousand: woocommerce_price_slider_params.currency_format_thousand_sep,
				precision: woocommerce_price_slider_params.currency_format_num_decimals,
				format: woocommerce_price_slider_params.currency_format
			});

			var maxHtml = accounting.formatMoney(max, {
				symbol: woocommerce_price_slider_params.currency_format_symbol,
				decimal: woocommerce_price_slider_params.currency_format_decimal_sep,
				thousand: woocommerce_price_slider_params.currency_format_thousand_sep,
				precision: woocommerce_price_slider_params.currency_format_num_decimals,
				format: woocommerce_price_slider_params.currency_format
			});

			$slider.siblings('.filter_price_slider_amount').find('span.from').html(minHtml);
			$slider.siblings('.filter_price_slider_amount').find('span.to').html(maxHtml);

			var $results = $slider.parents('.wromox-pf-checkboxes').find('.wromox-pf-results');
			var value = $results.find('.selected-value');
			if (min == minPrice && max == maxPrice) {
				value.remove();
			} else {
				if (value.length == 0) {
					$results.prepend('<li class="selected-value" data-title="price-filter" data-min="' + minPrice + '" data-max="' + maxPrice + '">' + minHtml + ' - ' + maxHtml + '</li>');
				} else {
					value.html(minHtml + ' - ' + maxHtml);
				}
			}

			$(document.body).trigger('price_slider_updated', [min, max]);
		});

		$('.wromox-pf-price-range .price_slider_widget').each(function () {
			var $this = $(this);
			var $minInput = $this.siblings('.filter_price_slider_amount').find('.min_price');
			var $maxInput = $this.siblings('.filter_price_slider_amount').find('.max_price');
			var minPrice = parseInt($minInput.data('min'));
			var maxPrice = parseInt($maxInput.data('max'));
			var currentMinPrice = parseInt($minInput.val());
			var currentMaxPrice = parseInt($maxInput.val());

			$('.price_slider_widget, .price_label').show();

			$this.slider({
				range: true,
				animate: true,
				min: minPrice,
				max: maxPrice,
				values: [currentMinPrice, currentMaxPrice],
				create: function () {
					if (currentMinPrice == minPrice && currentMaxPrice == maxPrice) {
						$minInput.val('');
						$maxInput.val('');
					}
					$(document.body).trigger('filter_price_slider_create', [currentMinPrice, currentMaxPrice, minPrice, maxPrice, $this]);
				},
				slide: function (event, ui) {
					if (ui.values[0] == minPrice && ui.values[1] == maxPrice) {
						$minInput.val('');
						$maxInput.val('');
					} else {
						$minInput.val(ui.values[0]);
						$maxInput.val(ui.values[1]);
					}
					$(document.body).trigger('filter_price_slider_slide', [ui.values[0], ui.values[1], minPrice, maxPrice, $this]);
				},
				change: function (event, ui) {
					$(document.body).trigger('price_slider_change', [ui.values[0], ui.values[1]]);
				}
			});
		});

		//Submit filter form
		$('.wromox-product-filters').one('click', '.wromox-pf-btn button', function (e) {
			var $form = $(this).parents('.wromox-product-filters');
			removeEmptyValues($form);
			changeFormAction($form);

			if (!$('body').hasClass('wromox-ajax-shop-on') || typeof ($.fn.pjax) == 'undefined' || !$form.hasClass('with-ajax')) return;
			$.pjax({
				container: '.main-page-wrapper',
				timeout: wromox_settings.pjax_timeout,
				url: $form.attr('action'),
				data: $form.serialize(),
				scrollTo: false
			});
			$(this).prop('disabled', true);
		});

		//Create labels after ajax
		$('.wromox-pf-checkboxes .pf-active > .pf-value').each(function () {
			var resultsWrapper = $(this).parents('.wromox-pf-checkboxes').find('.wromox-pf-results');
			resultsWrapper.prepend('<li class="selected-value" data-title="' + $(this).data('val') + '">' + $(this).data('title') + '</li>');
		});

	};

	/**
	*-------------------------------------------------------------------------------------------------------------------------------------------
	* Sticky sidebar button
	*-------------------------------------------------------------------------------------------------------------------------------------------
	*/

	wromoxThemeModule.stickySidebarBtn = function () {
		var $trigger = $('.wromox-show-sidebar-btn');
		var $stickyBtn = $('.shop-sidebar-opener:not(.toolbar)');

		if ($stickyBtn.length <= 0 || $trigger.length <= 0 || $(window).width() >= 1024) return;

		var stickySidebarBtnToggle = function () {
			var btnOffset = $trigger.offset().top + $trigger.outerHeight();
			var windowScroll = $(window).scrollTop();

			if (btnOffset < windowScroll) {
				$stickyBtn.addClass('wromox-sidebar-btn-shown');
			} else {
				$stickyBtn.removeClass('wromox-sidebar-btn-shown');
			}
		};

		stickySidebarBtnToggle();

		$(window).scroll(stickySidebarBtnToggle);
		$(window).resize(stickySidebarBtnToggle);
	};

	/**
	*-------------------------------------------------------------------------------------------------------------------------------------------
	* Product thumbnail images & photo swipe gallery
	*-------------------------------------------------------------------------------------------------------------------------------------------
	*/

	wromoxThemeModule.productImages = function () {
		// Init photoswipe

		var currentImage,
			$productGallery = $('.woocommerce-product-gallery'),
			$mainImages = $('.woocommerce-product-gallery__wrapper'),
			$thumbs = $productGallery.find('.thumbnails'),
			currentClass = 'current-image',
			PhotoSwipeTrigger = '.wromox-show-product-gallery';

		$thumbs.addClass('thumbnails-ready');

		if ($productGallery.hasClass('image-action-popup')) {
			PhotoSwipeTrigger += ', .woocommerce-product-gallery__image a';
		}

		$productGallery.on('click', '.woocommerce-product-gallery__image a', function (e) {
			e.preventDefault();
		});

		$productGallery.on('click', PhotoSwipeTrigger, function (e) {
			e.preventDefault();

			currentImage = $(this).attr('href');

			// build items array
			var items = getProductItems();

			wromoxThemeModule.callPhotoSwipe(getCurrentGalleryIndex(e), items);

		});

		$thumbs.on('click', '.image-link', function (e) {
			e.preventDefault();

			// if( $thumbs.hasClass('thumbnails-large') ) {
			//     var index = $(e.currentTarget).index() + 1;
			//     var items = getProductItems();
			//     callPhotoSwipe(index, items);
			//     return;
			// }

			// var href = $(this).attr('href'),
			//     src  = $(this).attr('data-single-image'),
			//     width = $(this).attr('data-width'),
			//     height = $(this).attr('data-height'),
			//     title = $(this).attr('title');

			// $thumbs.find('.' + currentClass).removeClass(currentClass);
			// $(this).addClass(currentClass);

			// if( $mainImages.find('img').attr('src') == src ) return;

			// $mainImages.addClass('loading-image').attr('href', href).find('img').attr('src', src).attr('srcset', src).one('load', function() {
			//     $mainImages.removeClass('loading-image').data('width', width).data('height', height).attr('title', title);
			// });

		});

		var getCurrentGalleryIndex = function (e) {
			if ($mainImages.hasClass('owl-carousel'))
				return $mainImages.find('.owl-item.active').index();
			else return $(e.currentTarget).parent().parent().index();
		};

		var getProductItems = function () {
			var items = [];

			$mainImages.find('figure a img').each(function () {
				var src = $(this).attr('data-large_image'),
					width = $(this).attr('data-large_image_width'),
					height = $(this).attr('data-large_image_height'),
					caption = $(this).data('caption');

				items.push({
					src: src,
					w: width,
					h: height,
					title: (wromox_settings.product_images_captions == 'yes') ? caption : false
				});

			});

			return items;
		};

		/* Fix zoom for first item firstly */

		// if ($productGallery.hasClass('image-action-zoom')) {
		// 	var zoom_target = $('.woocommerce-product-gallery__image');
		// 	var image_to_zoom = zoom_target.find('img');
		//
		// 	// But only zoom if the img is larger than its container.
		// 	if (image_to_zoom.attr('width') > $('.woocommerce-product-gallery').width()) {
		// 		zoom_target.trigger('zoom.destroy');
		// 		zoom_target.zoom({
		// 			touch: false
		// 		});
		// 	}
		// }
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Sticky add to cart
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.stickyAddToCart = function () {
		var $trigger = $('form.cart');
		var $stickyBtn = $('.wromox-sticky-btn');

		if ($stickyBtn.length <= 0 || $trigger.length <= 0 || ($(window).width() <= 768 && $stickyBtn.hasClass('mobile-off'))) return;

		var summaryOffset = $trigger.offset().top + $trigger.outerHeight();
		var $scrollToTop = $('.scrollToTop');

		var stickyAddToCartToggle = function () {
			var windowScroll = $(window).scrollTop();
			var windowHeight = $(window).height();
			var documentHeight = $(document).height();

			if (summaryOffset < windowScroll && windowScroll + windowHeight != documentHeight) {
				$stickyBtn.addClass('wromox-sticky-btn-shown');
				$scrollToTop.addClass('wromox-sticky-btn-shown');

			} else if (windowScroll + windowHeight == documentHeight || summaryOffset > windowScroll) {
				$stickyBtn.removeClass('wromox-sticky-btn-shown');
				$scrollToTop.removeClass('wromox-sticky-btn-shown');
			}
		};

		stickyAddToCartToggle();

		$(window).scroll(stickyAddToCartToggle);

		$('.wromox-sticky-add-to-cart').on('click', function (e) {
			e.preventDefault();
			$('html, body').animate({
				scrollTop: $('.elementor-widget-woocommerce-product-title,.summary-inner .product_title').offset().top
			}, 800);
		});

		// Wishlist.
		$('.wromox-sticky-btn .wromox-wishlist-btn a').on('click', function (e) {
			if (!$(this).hasClass('added')) {
				e.preventDefault();
			}

			$('.summary-inner > .wromox-wishlist-btn a').trigger('click');
		});

		$(document).on('added_to_wishlist', function () {
			$('.wromox-sticky-btn .wromox-wishlist-btn a').addClass('added');
		});

		// Compare.
		$('.wromox-sticky-btn .wromox-compare-btn a').on('click', function (e) {
			if (!$(this).hasClass('added')){
				e.preventDefault();
			}

			$('.summary-inner > .wromox-compare-btn a').trigger('click');
		});

		$(document).on('added_to_compare', function () {
			$('.wromox-sticky-btn .wromox-compare-btn a').addClass('added');
		});

		// Quantity.
		$('.wromox-sticky-btn-cart .qty').on('change', function(){
			$('.summary-inner .qty').val($(this).val());
		});

		$('.summary-inner .qty').on('change', function(){
			$('.wromox-sticky-btn-cart .qty').val($(this).val());
		});
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Login dropdown
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.loginDropdown = function () {
		if ($(window).width() <= 1024) {
			return;
		}

		$('.menu-item-register').each(function () {
			var $this = $(this),
				$content = $this.find('.login-dropdown-inner');

			$content.find('input[id="username"]').on('click', function () {
				$this.addClass('wd-active-login').removeClass('wd-active-link');
			});

			$content.find('input[id="username"]').on('input', function () {
				if ( $this.hasClass('wd-active-login') ) {
					$this.removeClass('wd-active-login').addClass('wd-active-link');
				}
			});

			$content.find('input').not('[id="username"]').on('click', function () {
				$this.removeClass('wd-active-login').removeClass('wd-active-link');
			});

			$(document).click(function (a) {
				if ( 'undefined' != typeof( a.target.className.length ) && a.target.className.indexOf('menu-item-register') == -1 && a.target.className.indexOf('input-text') == -1 ) {
					$this.removeClass('wd-active-login').removeClass('wd-active-link');
				}
			});

			$('.menu-item-register').on('mouseout', function (event) {
				if ( $this.hasClass('wd-active-link') ) {
					$this.removeClass('wd-active-link');
				}
			}).on('mouseleave', function () {
				if ( $this.hasClass('wd-active-link') ) {
					$this.removeClass('wd-active-link');
				}
			});
		});
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Login sidebar
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.loginSidebar = function () {
		var body = $('body');
		var loginFormSide = $('.login-form-side');
		var closeSide = $('.wromox-close-side');

		$('.login-side-opener').on('click', function (e) {
			e.preventDefault();
			if (isOpened()) {
				closeWidget();
			} else {
				setTimeout(function () {
					openWidget();
				}, 10);
			}
		});

		body.on('click touchstart', '.wromox-close-side', function () {
			if (isOpened()) closeWidget();
		});

		body.on('click', '.close-side-widget', function (e) {
			e.preventDefault();
			if (isOpened()) closeWidget();
		});

		$(document).keyup(function (e) {
			if (e.keyCode === 27 && isOpened()) closeWidget();
		});

		var closeWidget = function () {
			loginFormSide.removeClass('wromox-login-side-opened');
			closeSide.removeClass('wromox-close-side-opened');
		};

		var openWidget = function () {
			loginFormSide.addClass('wromox-login-side-opened');
			closeSide.addClass('wromox-close-side-opened');
		};

		var isOpened = function () {
			return loginFormSide.hasClass('wromox-login-side-opened');
		};
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Shop loader position
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.shopLoader = function () {
		var loaderClass = '.wromox-shop-loader',
			contentClass = '.products[data-source="main_loop"]',
			sidebarClass = '.area-sidebar-shop',
			sidebarLeftClass = 'sidebar-left',
			hiddenClass = 'hidden-loader',
			hiddenTopClass = 'hidden-from-top',
			hiddenBottomClass = 'hidden-from-bottom';

		var loaderVerticalPosition = function () {
			var $products = $(contentClass),
				$loader = $products.parent().find(loaderClass);

			if ($products.length < 1) return;

			var offset = $(window).height() / 2,
				scrollTop = $(window).scrollTop(),
				holderTop = $products.offset().top - offset,
				holderHeight = $products.height(),
				holderBottom = holderTop + holderHeight - 130;

			if (scrollTop < holderTop) {
				$loader.addClass(hiddenClass + ' ' + hiddenTopClass);
			} else if (scrollTop > holderBottom) {
				$loader.addClass(hiddenClass + ' ' + hiddenBottomClass);
			} else {
				$loader.removeClass(hiddenClass + ' ' + hiddenTopClass + ' ' + hiddenBottomClass);
			}
		};

		var loaderHorizontalPosition = function () {
			var $products = $(contentClass),
				$sidebar = $(sidebarClass),
				$loader = $products.parent().find(loaderClass),
				sidebarWidth = $sidebar.outerWidth();

			if ($products.length < 1) return;

			if (sidebarWidth > 0 && $sidebar.hasClass(sidebarLeftClass)) {
				if ($('body').hasClass('rtl')) {
					$loader.css({
						'marginLeft': - sidebarWidth / 2 - 15
					})
				} else {
					$loader.css({
						'marginLeft': sidebarWidth / 2 - 15
					})
				}
			} else if (sidebarWidth > 0) {
				if ($('body').hasClass('rtl')) {
					$loader.css({
						'marginLeft': sidebarWidth / 2 - 15
					})
				} else {
					$loader.css({
						'marginLeft': - sidebarWidth / 2 - 15
					})
				}
			}

		};

		$(window).off('scroll.loaderVerticalPosition');
		$(window).off('loaderHorizontalPosition');

		$(window).on('scroll.loaderVerticalPosition', loaderVerticalPosition);
		$(window).on('resize.loaderHorizontalPosition', loaderHorizontalPosition);

		loaderVerticalPosition();
		loaderHorizontalPosition();
	};

	/**
	*-------------------------------------------------------------------------------------------------------------------------------------------
	* "Sort by" widget reinit
	*-------------------------------------------------------------------------------------------------------------------------------------------
	*/
	wromoxThemeModule.sortByWidget = function () {
		if (!$('body').hasClass('wromox-ajax-shop-on') || typeof ($.fn.pjax) == 'undefined') return;

		$('.woocommerce-ordering').on('change', 'select.orderby', function () {
			var $form = $(this).closest('form');

			$form.find('[name="_pjax"]').remove();

			$.pjax({
				container: '.main-page-wrapper',
				timeout: wromox_settings.pjax_timeout,
				url: '?' + $form.serialize(),
				scrollTo: false
			});
		});

		$('.woocommerce-ordering').submit(function (e) {
			e.preventDefault(e);
		});
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Add filters dropdowns compatibility
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.filterDropdowns = function () {
		// Init
		$('.wromox-widget-layered-nav-dropdown-form').each(function () {
			var $form = $(this);
			var $select = $form.find('select');
			var slug = $select.data('slug');

			$select.change(function () {
				var val = $(this).val();
				$('input[name=filter_' + slug + ']').val(val);
			});

			if ($().selectWoo) {
				$select.selectWoo({
					placeholder: $select.data('placeholder'),
					minimumResultsForSearch: 5,
					width: '100%',
					allowClear: $select.attr('multiple') ? false : true,
					language: {
						noResults: function () {
							return $select.data('noResults');
						}
					}
				}).on('select2:unselecting', function () {
					$(this).data('unselecting', true);
				}).on('select2:opening', function (e) {
					if ($(this).data('unselecting')) {
						$(this).removeData('unselecting');
						e.preventDefault();
					}
				});
			}
		});

		function ajaxAction($element) {
			var $form = $element.parent('.wromox-widget-layered-nav-dropdown-form');
			if (!$('body').hasClass('wromox-ajax-shop-on') || typeof ($.fn.pjax) == 'undefined') {
				return;
			}

			$.pjax({
				container: '.main-page-wrapper',
				timeout: wromox_settings.pjax_timeout,
				url: $form.attr('action'),
				data: $form.serialize(),
				scrollTo: false
			});
		}

		$('.wromox-widget-layered-nav-dropdown__submit').on('click', function (e) {
			if (!$(this).siblings('select').attr('multiple') || !$('body').hasClass('wromox-ajax-shop-on')) {
				return;
			}

			ajaxAction($(this));

			$(this).prop('disabled', true);
		});

		$('.wromox-widget-layered-nav-dropdown-form select').on('change', function (e) {
			if (!$('body').hasClass('wromox-ajax-shop-on')) {
				$(this).parent().submit();
				return;
			}

			if ($(this).attr('multiple')) {
				return;
			}

			ajaxAction($(this));
		});

	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Sticky details block for special product type
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.stickyDetails = function () {
		if (
			!$('body').hasClass('wromox-product-sticky-on')
			|| $(window).width() <= 1024
		) return;

		var details = $('.entry-summary');

		details.each(function () {
			var $column = $(this),
				offset = 40,
				$inner = $column.find('.summary-inner'),
				$images = $column.parent().find('.product-images-inner');

			if ($('body').hasClass('enable-sticky-header') || $('.whb-sticky-row').length > 0 || $('.whb-sticky-header').length > 0) {
				offset = parseInt( wromox_settings.sticky_product_details_offset );
			}

			$images.imagesLoaded(function () {
				var diff = $inner.outerHeight() - $images.outerHeight();

				if (diff < -100) {
					$inner.stick_in_parent({
						offset_top: offset
					});
				} else if (diff > 100) {
					$images.stick_in_parent({
						offset_top: offset
					});
				}

				$(window).resize(function () {

					if ($(window).width() <= 1024) {
						$inner.trigger('sticky_kit:detach');
						$images.trigger('sticky_kit:detach');
					} else if ($inner.outerHeight() < $images.outerHeight()) {
						$inner.stick_in_parent({
							offset_top: offset
						});
					} else {
						$images.stick_in_parent({
							offset_top: offset
						});
					}

				});
			});

		});
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Product accordion
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.productAccordion = function () {
		var $accordion = $('.wc-tabs-wrapper');

		var time = 300;

		var hash = window.location.hash;
		var url = window.location.href;

		if (hash.toLowerCase().indexOf('comment-') >= 0 || hash === '#reviews' || hash === '#tab-reviews') {
			$accordion.find('.tab-title-reviews').addClass('active');
		} else if (url.indexOf('comment-page-') > 0 || url.indexOf('cpage=') > 0) {
			$accordion.find('.tab-title-reviews').addClass('active');
		} else {
			$accordion.find('.wromox-accordion-title').first().addClass('active');
		}

		$('.woocommerce-review-link').on('click', function () {
			$( '.wromox-accordion-title.tab-title-reviews' ).click();
		});

		$accordion.on('click', '.wromox-accordion-title', function (e) {
			e.preventDefault();

			var $this = $(this),
				$panel = $this.siblings('.woocommerce-Tabs-panel');

			var curentIndex = $this.parent().index();
			var oldIndex = $this.parent().siblings().find('.active').parent('.wromox-tab-wrapper').index();

			if ($this.hasClass('active')) {
				oldIndex = curentIndex;
				$this.removeClass('active');
				$panel.stop().slideUp(time);
			} else {
				$accordion.find('.wromox-accordion-title').removeClass('active');
				$accordion.find('.woocommerce-Tabs-panel').slideUp();
				$this.addClass('active');
				$panel.stop().slideDown(time);
			}

			if (oldIndex == -1) oldIndex = curentIndex;

			$(window).resize();

			setTimeout(function () {
				$(window).resize();
				if ($(window).width() < 1024 && curentIndex > oldIndex) {
					var $header = $('.sticky-header');
					var headerHeight = $header.length > 0 ? $header.outerHeight() : 0;
					$('html, body').animate({
						scrollTop: $this.offset().top - $this.outerHeight() - headerHeight - 50
					}, 500);
				}
			}, time);

			$(document).trigger('wood-images-loaded');
		});
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Product thumbnail images & photo swipe gallery
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.productImagesGallery = function () {
		var $mainGallery = $('.woocommerce-product-gallery__wrapper:not(.quick-view-gallery)');
		var $thumbs = $('.images .thumbnails');
		var $mainOwl = $('.woocommerce-product-gallery__wrapper');
		var thumbs_position = wromox_settings.product_gallery.thumbs_slider.position;

		// if (wromox_settings.product_gallery.thumbs_slider.position == 'centered' && $mainOwl.find('.product-image-wrap').length > 1) {
		//     var moveblock = $mainOwl.find('.product-image-wrap:eq(0)');
		//     moveblock.remove();
		//     $mainOwl.find('.product-image-wrap:eq(0)').after(moveblock);
		// }

		if (wromox_settings.product_gallery.images_slider) {
			if (wromox_settings.product_slider_auto_height == 'yes') {
				$('.product-images').imagesLoaded(function () {
					initMainGallery();
				});
			} else {
				initMainGallery();
			}
		} else if (jQuery(window).width() <= 1024 && (thumbs_position == 'bottom_combined' || thumbs_position == 'bottom_column' || thumbs_position == 'bottom_grid')) {
			initMainGallery();
		}

		if (wromox_settings.product_gallery.thumbs_slider.enabled && wromox_settings.product_gallery.images_slider) {
			initThumbnailsMarkup();
			if (wromox_settings.product_gallery.thumbs_slider.position == 'left' && jQuery(window).width() > 1024 && typeof ($.fn.slick) != 'undefined') {
				initThumbnailsVertical();
			} else {
				initThumbnailsHorizontal();
			}
		}

		function initMainGallery() {
			$mainGallery.trigger('destroy.owl.carousel');
			$mainGallery.addClass('owl-carousel').owlCarousel(wromoxTheme.mainCarouselArg);
			$(document).trigger('wood-images-loaded');
		};

		function initThumbnailsMarkup() {
			var markup = '';

			$mainGallery.find('.woocommerce-product-gallery__image').each(function () {
				var image = $(this).data('thumb'),
					alt = $(this).find('a > img').attr('alt'),
					title = $(this).find('a > img').attr('title');

				markup += '<div class="product-image-thumbnail"><img alt="' + alt + '" title="' + title + '" src="' + image + '" /></div>';
			});

			if ($thumbs.hasClass('slick-slider')) {
				$thumbs.slick('unslick');
			} else if ($thumbs.hasClass('owl-carousel')) {
				$thumbs.trigger('destroy.owl.carousel');
			}

			$thumbs.empty();
			$thumbs.append(markup);
		};

		function initThumbnailsVertical() {
			$thumbs.slick({
				slidesToShow: wromox_settings.product_gallery.thumbs_slider.items.vertical_items,
				slidesToScroll: wromox_settings.product_gallery.thumbs_slider.items.vertical_items,
				vertical: true,
				verticalSwiping: true,
				infinite: false,
			});

			$thumbs.on('click', '.product-image-thumbnail', function (e) {
				var i = $(this).index();
				$mainOwl.trigger('to.owl.carousel', i);
			});

			$mainOwl.on('changed.owl.carousel', function (e) {
				var i = e.item.index;
				$thumbs.slick('slickGoTo', i);
				$thumbs.find('.active-thumb').removeClass('active-thumb');
				$thumbs.find('.product-image-thumbnail').eq(i).addClass('active-thumb');
			});

			$thumbs.find('.product-image-thumbnail').eq(0).addClass('active-thumb');
		};

		function initThumbnailsHorizontal() {
			$thumbs.addClass('owl-carousel').owlCarousel({
				rtl: $('body').hasClass('rtl'),
				items: wromox_settings.product_gallery.thumbs_slider.items.desktop,
				responsive: {
					1025: {
						items: wromox_settings.product_gallery.thumbs_slider.items.desktop
					},
					769: {
						items: wromox_settings.product_gallery.thumbs_slider.items.tablet_landscape
					},
					577: {
						items: wromox_settings.product_gallery.thumbs_slider.items.tablet
					},
					0: {
						items: wromox_settings.product_gallery.thumbs_slider.items.mobile
					}
				},
				dots: false,
				nav: true,
				// mouseDrag: false,
				navText: false,
			});

			var $thumbsOwl = $thumbs.owlCarousel();

			$thumbs.on('mouseup', '.owl-item', function (e) {
				var i = $(this).index();
				$thumbsOwl.trigger('to.owl.carousel', i);
				$mainOwl.trigger('to.owl.carousel', i);
			});

			$mainOwl.on('changed.owl.carousel', function (e) {
				var i = e.item.index;
				$thumbsOwl.trigger('to.owl.carousel', i);
				$thumbs.find('.active-thumb').removeClass('active-thumb');
				$thumbs.find('.product-image-thumbnail').eq(i).addClass('active-thumb');
			});

			$thumbs.find('.product-image-thumbnail').eq(0).addClass('active-thumb');
		};

		// Update first thumbnail on variation change
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * WooCommerce adding to cart
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.addToCart = function () {
		var that = this;
		var timeoutNumber = 0;
		var timeout;

		that.addToCartAllTypes();

		$('body').on('added_to_cart', function (event, fragments, cart_hash) {

			if (wromox_settings.add_to_cart_action == 'popup') {

				var html = [
					'<div class="added-to-cart">',
					'<h4>' + wromox_settings.added_to_cart + '</h4>',
					'<a href="#" class="btn btn-style-link btn-color-default close-popup">' + wromox_settings.continue_shopping + '</a>',
					'<a href="' + wromox_settings.cart_url + '" class="btn btn-color-primary view-cart">' + wromox_settings.view_cart + '</a>',
					'</div>',
				].join("");

				$.magnificPopup.open({
					removalDelay: 500, //delay removal by X to allow out-animation
					tClose: wromox_settings.close,
					tLoading: wromox_settings.loading,
					callbacks: {
						beforeOpen: function () {
							this.st.mainClass = wromoxTheme.popupEffect + '  cart-popup-wrapper';
						},
					},
					items: {
						src: '<div class="mfp-with-anim white-popup popup-added_to_cart">' + html + '</div>',
						type: 'inline'
					}
				});

				$('.white-popup').on('click', '.close-popup', function (e) {
					e.preventDefault();
					$.magnificPopup.close();
				});

				closeAfterTimeout();
			} else if (wromox_settings.add_to_cart_action == 'widget') {

				clearTimeout(timeoutNumber);

				if ($('.act-scroll .wromox-shopping-cart, .whb-sticked .wromox-shopping-cart').length > 0) {
					$('.act-scroll .wromox-shopping-cart, .whb-sticked .wromox-shopping-cart').addClass('display-widget');
				} else {
					$('.whb-header .wromox-shopping-cart').addClass('display-widget');
				}

				if ($('.cart-widget-opener').length > 0) {
					$('.cart-widget-opener').first().trigger('click');
				}

				timeoutNumber = setTimeout(function () {
					$('.display-widget').removeClass('display-widget');
				}, 3500);


				closeAfterTimeout();
			}

			that.btnsToolTips();

		});

		var closeAfterTimeout = function () {
			if ('yes' !== wromox_settings.add_to_cart_action_timeout) {
				return false;
			}

			clearTimeout(timeout);

			timeout = setTimeout(function () {
				$('.wromox-close-side').trigger('click');
				$.magnificPopup.close();
			}, parseInt(wromox_settings.add_to_cart_action_timeout_number) * 1000);
		};
	},

	wromoxThemeModule.addToCartAllTypes = function () {
		if (wromox_settings.ajax_add_to_cart == false) return;
		// AJAX add to cart for all types of products

		$('body').on('submit', 'form.cart', function (e) {
			var $productWrapper = $(this).parents('.single-product-page');

			if ($productWrapper.length === 0) {
				$productWrapper = $(this).parents('.product-quick-view');
			}

			if ($productWrapper.hasClass('product-type-external') || $productWrapper.hasClass('product-type-zakeke')) return;

			e.preventDefault();

			var $form = $(this),
				$thisbutton = $form.find('.single_add_to_cart_button'),
				data = $form.serialize();

			data += '&action=wromox_ajax_add_to_cart';

			if ($thisbutton.val()) {
				data += '&add-to-cart=' + $thisbutton.val();
			}

			$thisbutton.removeClass('added not-added');
			$thisbutton.addClass('loading');

			// Trigger event
			$(document.body).trigger('adding_to_cart', [$thisbutton, data]);

			$.ajax({
				url: wromox_settings.ajaxurl,
				data: data,
				method: 'POST',
				success: function (response) {
					if (!response) {
						return;
					}

					var this_page = window.location.toString();

					this_page = this_page.replace('add-to-cart', 'added-to-cart');

					if (response.error && response.product_url) {
						window.location = response.product_url;
						return;
					}

					// Redirect to cart option
					if (wromox_settings.cart_redirect_after_add === 'yes') {
						window.location = wromox_settings.cart_url;
						return;
					} else {

						$thisbutton.removeClass('loading');

						var fragments = response.fragments;
						var cart_hash = response.cart_hash;


						// Block fragments class
						if (fragments) {
							$.each(fragments, function (key) {
								$(key).addClass('updating');
							});
						}

						// Replace fragments
						if (fragments) {
							$.each(fragments, function (key, value) {
								$(key).replaceWith(value);
							});
						}

						// Show notices
						if (response.notices.indexOf('error') > 0) {
							$('body').append(response.notices);
							$thisbutton.addClass('not-added');
						} else {
							if (wromox_settings.add_to_cart_action == 'widget')
								$.magnificPopup.close();

							// Changes button classes
							$thisbutton.addClass('added');
							// Trigger event so themes can refresh other areas
							$(document.body).trigger('added_to_cart', [fragments, cart_hash, $thisbutton]);
						}

					}
				},
				error: function () {
					console.log('ajax adding to cart error');
				},
				complete: function () { },
			});

		});
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Quick Shop
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.quickShop = function () {
		if ('no' === wromox_settings.quick_shop) {
			return;
		}

		var btnSelector = '.product-grid-item.product-type-variable .add_to_cart_button';

		$(document).on('click', btnSelector, function (e) {
			e.preventDefault();

			var $this = $(this),
				$product = $this.parents('.product').first(),
				$content = $product.find('.quick-shop-form'),
				id = $product.data('id'),
				loadingClass = 'btn-loading';

			if ($this.hasClass(loadingClass)) return;


			// Simply show quick shop form if it is already loaded with AJAX previously
			if ($product.hasClass('quick-shop-loaded')) {
				$product.addClass('quick-shop-shown');
				$('body').trigger('wromox-quick-view-displayed');
				return;
			}

			$this.addClass(loadingClass);
			$product.addClass('wd-loading-quick-shop');

			$.ajax({
				url: wromox_settings.ajaxurl,
				data: {
					action: 'wromox_quick_shop',
					id: id,
				},
				method: 'get',
				success: function (data) {
					// insert variations form
					$content.append(data);

					initVariationForm($product);
					wromoxThemeModule.swatchesVariations();
					wromoxThemeModule.btnsToolTips();
				},
				complete: function () {
					setTimeout(function () {
						$this.removeClass(loadingClass);
						$product.removeClass('wd-loading-quick-shop');
						$product.addClass('quick-shop-shown quick-shop-loaded');
						$('body').trigger('wromox-quick-view-displayed');
					}, 100);
				},
				error: function () {
				},
			});

		})

			.on('click', '.quick-shop-close', function () {
				var $this = $(this),
					$product = $this.parents('.product');

				$product.removeClass('quick-shop-shown');
			});

		$(document.body).on('added_to_cart', function () {
			$('.product').removeClass('quick-shop-shown');
		});

		function initVariationForm($product) {
			$product.find('.variations_form').wc_variation_form().find('.variations select:eq(0)').change();
			$product.find('.variations_form').trigger('wc_variation_form');
		}
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Quick View
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.quickViewInit = function () {
		// Open popup with product info when click on Quick View button
		$(document).on('click', '.open-quick-view', function (e) {

			e.preventDefault();

			if ($('.open-quick-view').hasClass('loading')) {
				return true;
			}

			var productId = $(this).data('id'),
				loopName = $(this).data('loop-name'),
				closeText = wromox_settings.close,
				loadingText = wromox_settings.loading,
				loop = $(this).data('loop'),
				prev = '',
				next = '',
				loopBtns = $('.quick-view').find('[data-loop-name="' + loopName + '"]'),
				btn = $(this);

			btn.addClass('loading');

			if (typeof loopBtns[loop - 1] != 'undefined') {
				prev = loopBtns.eq(loop - 1).addClass('quick-view-prev');
				prev = $('<div>').append(prev.clone()).html();
			}

			if (typeof loopBtns[loop + 1] != 'undefined') {
				next = loopBtns.eq(loop + 1).addClass('quick-view-next');
				next = $('<div>').append(next.clone()).html();
			}

			wromoxThemeModule.quickViewLoad(productId, btn, prev, next);

		});
	};

	wromoxThemeModule.quickViewCarousel = function () {
		$('.product-quick-view .woocommerce-product-gallery__wrapper').trigger('destroy.owl.carousel');
		$('.product-quick-view .woocommerce-product-gallery__wrapper').addClass('owl-carousel').owlCarousel({
			rtl: $('body').hasClass('rtl'),
			items: 1,
			dots: false,
			nav: true,
			navText: false
		});
	};

	wromoxThemeModule.quickViewLoad = function (id, btn, prev, next) {
		var data = {
			id: id,
			action: "wromox_quick_view",
		};

		var initPopup = function (data) {
			$.magnificPopup.open({
				items: {
					src: '<div class="mfp-with-anim popup-quick-view">' + data + '</div>', // can be a HTML string, jQuery object, or CSS selector
					type: 'inline'
				},
				tClose: wromox_settings.close,
				tLoading: wromox_settings.loading,
				removalDelay: 500, //delay removal by X to allow out-animation
				callbacks: {
					beforeOpen: function () {
						this.st.mainClass = wromoxTheme.popupEffect + ' quick-view-wrapper';
					},
					open: function () {
						$('.variations_form').each(function () {
							$(this).wc_variation_form().find('.variations select:eq(0)').change();
						});
						$('.variations_form').trigger('wc_variation_form');
						$('body').trigger('wromox-quick-view-displayed');
						wromoxThemeModule.swatchesVariations();

						wromoxThemeModule.btnsToolTips();
						setTimeout(function () {
							wromoxThemeModule.nanoScroller();
						}, 300);
						wromoxThemeModule.quickViewCarousel();
					}
				},
			});
		}

		$.ajax({
			url: wromox_settings.ajaxurl,
			data: data,
			method: 'get',
			success: function (data) {
				if (wromox_settings.quickview_in_popup_fix) {
					$.magnificPopup.close();
					setTimeout(function () {
						initPopup(data);
					}, 500);
				} else {
					initPopup(data);
				}
			},
			complete: function () {
				btn.removeClass('loading');
			},
			error: function () {
			},
		});
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Swatches variations
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.swatchesVariations = function () {
		var $variation_forms = $('.variations_form');
		var variationGalleryReplace = false;
		var swathesSelected = false;

		// Firefox mobile fix
		$('.variations_form .label').on('click', function (e) {
			if ($(this).siblings('.value').hasClass('with-swatches')) {
				e.preventDefault();
			}
		});

		$variation_forms.each(function () {
			var $variation_form = $(this);

			if ($variation_form.data('swatches')) return;
			$variation_form.data('swatches', true);

			// If AJX
			if (!$variation_form.data('product_variations')) {
				$variation_form.find('.swatches-select').find('> div').addClass('swatch-enabled');
			}

			if ($('.swatches-select > div').hasClass('active-swatch')) {
				$variation_form.addClass('variation-swatch-selected');
			}

			$variation_form.on('click', '.swatches-select > div', function () {
				var value = $(this).data('value');
				var id = $(this).parent().data('id');
				var title = $(this).data('title');

				// $variation_form.trigger('check_variations', ['attribute_' + id, true]);
				resetSwatches($variation_form);

				//$variation_form.find('select#' + id).val('').trigger('change');
				//$variation_form.trigger('check_variations');

				if ($(this).hasClass('active-swatch')) {
					// Removed since 2.9 version as not necessary
					// $variation_form.find( '.variations select' ).val( '' ).change();
					// $variation_form.trigger( 'reset_data' );
					// $(this).removeClass('active-swatch')
					return;
				}

				if ($(this).hasClass('swatch-disabled')) return;
				$variation_form.find('select#' + id).val(value).trigger('change');
				$(this).parent().find('.active-swatch').removeClass('active-swatch');
				$(this).addClass('active-swatch');
				resetSwatches($variation_form);

				if ((wromox_settings.swatches_labels_name === 'yes' && $(window).width() >= 769) || $(window).width() <= 768) {
					//Labels.
					$(this).parents('tr').find('.wd-attr-selected').html(title);
				}
			})


				// On clicking the reset variation button
				.on('click', '.reset_variations', function (event) {
					$variation_form.find('.active-swatch').removeClass('active-swatch');

					if ((wromox_settings.swatches_labels_name === 'yes' && $(window).width() >= 769) || $(window).width() <= 768) {
						// Labels.
						$variation_form.find('.wd-attr-selected').html('');
					}
				})

				.on('reset_data', function () {
					var all_attributes_chosen = true;
					var some_attributes_chosen = false;

					$variation_form.find('.variations select').each(function () {
						var attribute_name = $(this).data('attribute_name') || $(this).attr('name');
						var value = $(this).val() || '';

						if (value.length === 0) {
							all_attributes_chosen = false;
						} else {
							some_attributes_chosen = true;
						}

					});

					if (all_attributes_chosen) {
						$(this).parent().find('.active-swatch').removeClass('active-swatch');
					}

					$variation_form.removeClass('variation-swatch-selected');

					var $mainOwl = $('.woocommerce-product-gallery__wrapper.owl-carousel');

					resetSwatches($variation_form);

					replaceMainGallery('default', $variation_form);

					if (!$mainOwl.hasClass('owl-carousel')) return;

					if (wromox_settings.product_slider_auto_height == 'yes') {
						if (!isQuickView() && isVariationGallery('default', $variation_form) && variationGalleryReplace) {
							$mainOwl.trigger('destroy.owl.carousel');
						}
						$('.product-images').imagesLoaded(function () {
							$mainOwl = $mainOwl.owlCarousel(wromoxTheme.mainCarouselArg);
							$mainOwl.trigger('refresh.owl.carousel');
						});
					} else {
						$mainOwl = $mainOwl.owlCarousel(wromoxTheme.mainCarouselArg);
						$mainOwl.trigger('refresh.owl.carousel');
					}

					var slide_go_to = wromox_settings.product_gallery.thumbs_slider.position == 'centered' ? wromox_settings.centered_gallery_start : 0;
					if (isQuickView()) slide_go_to = 0;
					$mainOwl.trigger('to.owl.carousel', slide_go_to);
				})


				// Update first tumbnail
				.on('reset_image', function () {
					var $thumb = $('.thumbnails .product-image-thumbnail img').first();
					if (!isQuickView() && !isQuickShop($variation_form)) {
						$thumb.wc_reset_variation_attr('src');
					}
				})
				.on('show_variation', function (e, variation, purchasable) {
					if (((wromox_settings.swatches_labels_name === 'yes' && $(window).width() >= 769) || $(window).width() <= 768) && ! swathesSelected) {
						// Labels.
						$variation_form.find('.active-swatch').each(function () {
							var title = $(this).data('title');
							$(this).parents('tr').find('.wd-attr-selected').html(title);
						});

						swathesSelected = true;
					}

					if (!variation.image.src) {
						return;
					}

					// See if the gallery has an image with the same original src as the image we want to switch to.
					var galleryHasImage = $variation_form.parents('.single-product-content').find('.thumbnails .product-image-thumbnail img[data-o_src="' + variation.image.thumb_src + '"]').length > 0;
					var $firstThumb = $variation_form.parents('.single-product-content').find('.thumbnails .product-image-thumbnail img').first();

					// If the gallery has the image, reset the images. We'll scroll to the correct one.
					if (galleryHasImage) {
						$firstThumb.wc_reset_variation_attr('src');
					}

					if (!isQuickShop($variation_form) && !replaceMainGallery(variation.variation_id, $variation_form)) {
						if ($firstThumb.attr('src') != variation.image.thumb_src) {
							$firstThumb.wc_set_variation_attr('src', variation.image.src);
						}
						wromoxThemeModule.initZoom();
					}

					$variation_form.addClass('variation-swatch-selected');

					if (!isQuickShop($variation_form) && !isQuickView()) {
						scrollToTop();
					}

					var $mainOwl = $('.woocommerce-product-gallery__wrapper.owl-carousel');

					if (!$mainOwl.hasClass('owl-carousel')) return;

					if (wromox_settings.product_slider_auto_height == 'yes') {
						if (!isQuickView() && isVariationGallery(variation.variation_id, $variation_form) && variationGalleryReplace) {
							$mainOwl.trigger('destroy.owl.carousel');
						}
						$('.product-images').imagesLoaded(function () {
							$mainOwl = $mainOwl.owlCarousel(wromoxTheme.mainCarouselArg);
							$mainOwl.trigger('refresh.owl.carousel');
						});
					} else {
						$mainOwl = $mainOwl.owlCarousel(wromoxTheme.mainCarouselArg);
						$mainOwl.trigger('refresh.owl.carousel');
					}

					var $thumbs = $('.images .thumbnails');

					$mainOwl.trigger('to.owl.carousel', 0);

					if ($thumbs.hasClass('owl-carousel')) {
						$thumbs.owlCarousel().trigger('to.owl.carousel', 0);
						$thumbs.find('.active-thumb').removeClass('active-thumb');
						$thumbs.find('.product-image-thumbnail').eq(0).addClass('active-thumb');
					} else if ($thumbs.hasClass('slick-slider')) {
						$thumbs.slick('slickGoTo', 0);
						if (!$thumbs.find('.product-image-thumbnail').eq(0).hasClass('active-thumb')) {
							$thumbs.find('.active-thumb').removeClass('active-thumb');
							$thumbs.find('.product-image-thumbnail').eq(0).addClass('active-thumb');
						}
					}

				});
		})

		var resetSwatches = function ($variation_form) {

			// If using AJAX
			if (!$variation_form.data('product_variations')) return;

			$variation_form.find('.variations select').each(function () {

				var select = $(this);
				var swatch = select.parent().find('.swatches-select');
				var options = select.html();
				// var options = select.data('attribute_html');
				options = $(options);

				swatch.find('> div').removeClass('swatch-enabled').addClass('swatch-disabled');

				options.each(function (el) {
					var value = $(this).val();

					if ($(this).hasClass('enabled')) {
						// if( ! el.disabled ) {
						swatch.find('div[data-value="' + value + '"]').removeClass('swatch-disabled').addClass('swatch-enabled');
					} else {
						swatch.find('div[data-value="' + value + '"]').addClass('swatch-disabled').removeClass('swatch-enabled');
					}

				});

			});
		};

		var isQuickView = function () {
			return $('.single-product-content').hasClass('product-quick-view');
		};

		var isQuickShop = function ($form) {
			return $form.parent().hasClass('quick-shop-form');
		};

		var isVariationGallery = function (key, $variationForm) {
			if ( 'old' === wromox_settings.variation_gallery_storage_method ) {
				return isVariationGalleryOld(key);
			} else {
				return isVariationGalleryNew(key, $variationForm);
			}
		};

		var isVariationGalleryOld = function (key) {
			if (typeof wromox_variation_gallery_data === 'undefined' && typeof wromox_qv_variation_gallery_data === 'undefined' ) {
				return;
			}

			var variation_gallery_data = isQuickView() ? wromox_qv_variation_gallery_data : wromox_variation_gallery_data;

			return typeof variation_gallery_data !== 'undefined' && variation_gallery_data && variation_gallery_data[key];
		};

		var isVariationGalleryNew = function (key, $variationForm) {
			var data = getAdditionalVariationsImagesData($variationForm);

			return typeof data !== 'undefined' && data && data[key] && data[key].length > 1;
		};

		var scrollToTop = function () {
			if ((wromox_settings.swatches_scroll_top_desktop == 1 && $(window).width() >= 1024) || (wromox_settings.swatches_scroll_top_mobile == 1 && $(window).width() <= 1024)) {
				var $page = $('html, body');

				$page.stop(true);
				$(window).on('mousedown wheel DOMMouseScroll mousewheel keyup touchmove', function () {
					$page.stop(true);
				});
				$page.animate({
					scrollTop: $('.product-image-summary').offset().top - 150
				}, 800);
				$('.wromox-swatch').tooltip('hide');
			}
		};

		var getAdditionalVariationsImagesData = function($variationForm) {
			var rawData = $variationForm.data('product_variations');
			var data = [];

			if (!rawData) {
				return data;
			}

			rawData.forEach(function(value) {
				data[value.variation_id] = value.additional_variation_images;
				data['default'] = value.additional_variation_images_default;
			});

			return data;
		};

		var replaceMainGallery = function (key, $variationForm) {
			if ( 'old' === wromox_settings.variation_gallery_storage_method ) {
				if (!isVariationGallery(key, $variationForm) || isQuickShop($variationForm) || ('default' === key && !variationGalleryReplace)) {
					return false;
				}
				replaceMainGalleryOld(key, $variationForm);
			} else {
				if (!isVariationGallery(key, $variationForm) || isQuickShop($variationForm) || ('default' === key && !variationGalleryReplace)) {
					return false;
				}
				var data = getAdditionalVariationsImagesData($variationForm);
				replaceMainGalleryNew(data[key], $variationForm);
			}

			wromoxThemeModule.productImagesGallery();
			wromoxThemeModule.quickViewCarousel();
			$(window).trigger('main_gallery_replaced');
			$('.woocommerce-product-gallery__image').trigger('zoom.destroy');
			if (!isQuickView()) {
				wromoxThemeModule.initZoom();
			}

			if ('default' === key) {
				variationGalleryReplace = false;
			} else {
				variationGalleryReplace = true;
			}

			$(window).resize();

			return true;
		};

		var replaceMainGalleryOld = function (key, $variationForm) {
			var variation_gallery_data = isQuickView() ? wromox_qv_variation_gallery_data : wromox_variation_gallery_data;

			var imagesData = variation_gallery_data[key];
			var $mainGallery = $variationForm.parents('.single-product-content').find('.woocommerce-product-gallery__wrapper');

			$mainGallery.empty();

			for (var index = 0; index < imagesData.length; index++) {
				var $html = '<div class="product-image-wrap"><figure data-thumb="' + imagesData[index].data_thumb + '" class="woocommerce-product-gallery__image">';

				if (!isQuickView()) {
					$html += '<a href="' + imagesData[index].href + '">';
				}

				$html += imagesData[index].image;

				if (!isQuickView()) {
					$html += '</a>';
				}

				$html += '</figure></div>';

				$mainGallery.append($html);
			}
		};

		var replaceMainGalleryNew = function(imagesData, $variationForm) {
			var $mainGallery = $variationForm.parents('.single-product-content').find('.woocommerce-product-gallery__wrapper');
			$mainGallery.empty();

			for (var key in imagesData) {
				var $html = '<div class="product-image-wrap"><figure class="woocommerce-product-gallery__image" data-thumb="' + imagesData[key].thumbnail_src + '">';

				if (!isQuickView()) {
					$html += '<a href="' + imagesData[key].full_src + '" data-elementor-open-lightbox="no">';
				}

				var srcset = imagesData[key].srcset ? 'srcset="' + imagesData[key].srcset + '"' : '';

				$html += '<img width="' + imagesData[key].width + '" height="' + imagesData[key].height + '" src="' + imagesData[key].src + '" class="' + imagesData[key].class + '" alt="' + imagesData[key].alt + '" title="' + imagesData[key].title + '" data-caption="' + imagesData[key].data_caption + '" data-src="' + imagesData[key].data_src + '"  data-large_image="' + imagesData[key].data_large_image + '" data-large_image_width="' + imagesData[key].data_large_image_width + '" data-large_image_height="' + imagesData[key].data_large_image_height + '" ' + srcset + ' sizes="' + imagesData[key].sizes + '" />';

				if (!isQuickView()) {
					$html += '</a>';
				}

				$html += '</figure></div>';


				$mainGallery.append($html);
			}
		};
	};

	wromoxThemeModule.swatchesOnGrid = function () {
		$('body').on('click', '.swatch-on-grid', function () {

			var src, srcset, image_sizes;

			var imageSrc = $(this).data('image-src'),
				imageSrcset = $(this).data('image-srcset'),
				imageSizes = $(this).data('image-sizes');

			if (typeof imageSrc == 'undefined' || '' === imageSrc) {
				return;
			}

			var product = $(this).parents('.product-grid-item'),
				image = product.find('.product-image-link > img'),
				srcOrig = image.data('original-src'),
				srcsetOrig = image.data('original-srcset'),
				sizesOrig = image.data('original-sizes');

			if (typeof srcOrig == 'undefined') {
				image.data('original-src', image.attr('src'));
			}

			if (typeof srcsetOrig == 'undefined') {
				image.data('original-srcset', image.attr('srcset'));
			}

			if (typeof sizesOrig == 'undefined') {
				image.data('original-sizes', image.attr('sizes'));
			}


			if ($(this).hasClass('active-swatch')) {
				src = srcOrig;
				srcset = srcsetOrig;
				image_sizes = sizesOrig;
				$(this).removeClass('active-swatch');
				product.removeClass('product-swatched');
			} else {
				$(this).parent().find('.active-swatch').removeClass('active-swatch');
				$(this).addClass('active-swatch');
				product.addClass('product-swatched');
				src = imageSrc;
				srcset = imageSrcset;
				image_sizes = imageSizes;
			}

			if (image.attr('src') == src) return;

			product.addClass('wd-loading-image');

			image.attr('src', src).attr('srcset', srcset).attr('image_sizes', image_sizes).one('load', function () {
				product.removeClass('wd-loading-image');
			});

		});
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Products tabs element AJAX loading
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.productsTabs = function () {
		var process = false;

		$('.wromox-products-tabs').each(function () {
			var $this = $(this),
				$inner = $this.find('.wromox-tab-content'),
				cache = [];

			if ($inner.find('.owl-carousel').length < 1) {
				cache[0] = {
					html: $inner.html()
				};
			}

			$this.find('.products-tabs-title li').on('click', function (e) {
				e.preventDefault();

				var $this = $(this),
					atts = $this.data('atts'),
					index = $this.index();

				if (process || $this.hasClass('active-tab-title')) return; process = true;

				loadTab(atts, index, $inner, $this, cache, function (data) {
					if (data.html) {
						$inner.html(data.html);

						$(document).trigger('wood-images-loaded');
						$(document).trigger('wood-products-tabs-loaded');

						wromoxThemeModule.productHover();
						wromoxThemeModule.btnsToolTips();
						wromoxThemeModule.shopMasonry();
						wromoxThemeModule.countDownTimer();
						wromoxThemeModule.productLoaderPosition();
						wromoxThemeModule.productsLoadMore();
						wromoxThemeModule.productMoreDescription();
						wromoxThemeModule.gridQuantity();
					}
				});

			});

			var $nav = $this.find('.tabs-navigation-wrapper'),
				$subList = $nav.find('ul'),
				time = 300;

			$nav.on('click', '.open-title-menu', function () {
				var $btn = $(this);

				if ($subList.hasClass('list-shown')) {
					$btn.removeClass('toggle-active');
					$subList.stop().slideUp(time).removeClass('list-shown');
				} else {
					$btn.addClass('toggle-active');
					$subList.addClass('list-shown');
					setTimeout(function () {
						$('body').one('click', function (e) {
							var target = e.target;
							if (!$(target).is('.tabs-navigation-wrapper') && !$(target).parents().is('.tabs-navigation-wrapper')) {
								$btn.removeClass('toggle-active');
								$subList.removeClass('list-shown');
								return false;
							}
						});
					}, 10);
				}

			})
				.on('click', 'li', function () {
					var $btn = $nav.find('.open-title-menu'),
						text = $(this).text();

					if ($subList.hasClass('list-shown')) {
						$btn.removeClass('toggle-active').text(text);
						$subList.removeClass('list-shown');
					}
				});

		});

		var loadTab = function (atts, index, holder, btn, cache, callback) {

			btn.parent().find('.active-tab-title').removeClass('active-tab-title');
			btn.addClass('active-tab-title')

			if (cache[index]) {
				holder.addClass('loading');
				setTimeout(function () {
					callback(cache[index]);
					holder.removeClass('loading');
					process = false;
				}, 300);
				return;
			}

			holder.addClass('loading').parent().addClass('element-loading');

			btn.addClass('loading');

			$.ajax({
				url: wromox_settings.ajaxurl,
				data: {
					atts: atts,
					action: 'wromox_get_products_tab_shortcode',
				},
				dataType: 'json',
				method: 'POST',
				success: function (data) {
					cache[index] = data;
					callback(data);
				},
				error: function (data) {
					console.log('ajax error');
				},
				complete: function () {
					holder.removeClass('loading').parent().removeClass('element-loading');
					btn.removeClass('loading');
					process = false;
					wromoxThemeModule.compare();
				},
			});
		};
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Load more button for products shortcode
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.productsLoadMore = function () {
		var process = false,
			intervalID;

		$('.wromox-products-element').each(function () {
			var $this = $(this),
				cache = [],
				inner = $this.find('.wromox-products-holder'),
				atts = inner.data('atts');

			if (!inner.hasClass('pagination-arrows')) return;

			cache[1] = {
				items: inner.html(),
				status: 'have-posts'
			};

			$this.on('recalc', function () {
				calc();
			});

			$(window).resize(function () {
				calc();
			});

			var calc = function () {
				var height = inner.outerHeight();
				if (atts.elementor){
					height = height - parseInt(atts.spacing);
				}
				$this.stop().css({ minHeight: height });
			};


			// sticky buttons

			var body = $('body'),
				btnWrap = $this.find('.products-footer'),
				btnLeft = btnWrap.find('.wromox-products-load-prev'),
				btnRight = btnWrap.find('.wromox-products-load-next'),
				loadWrapp = $this.find('.wromox-products-loader'),
				scrollTop,
				holderTop,
				btnLeftOffset,
				btnRightOffset,
				holderBottom,
				holderHeight,
				holderWidth,
				btnsHeight,
				offsetArrow = 50,
				offset,
				windowWidth;

			if (body.hasClass('rtl')) {
				btnLeft = btnRight;
				btnRight = btnWrap.find('.wromox-products-load-prev');
			}

			$(window).scroll(function () {
				buttonsPos();
			});

			setTimeout(function () {
				buttonsPos();
			}, 500);

			function buttonsPos() {

				offset = $(window).height() / 2;

				windowWidth = $(window).outerWidth(true);

				holderWidth = $this.outerWidth(true);

				scrollTop = $(window).scrollTop();

				holderTop = $this.offset().top - offset;

				btnLeftOffset = $this.offset().left - offsetArrow;

				btnRightOffset = holderWidth + $this.offset().left + offsetArrow - btnRight.outerWidth();

				btnsHeight = btnLeft.outerHeight();

				holderHeight = $this.height() - btnsHeight;

				holderBottom = holderTop + holderHeight;

				if ($(window).width() <= 1024) {
					btnLeftOffset = btnLeftOffset + 35;
					btnRightOffset = btnRightOffset - 35;
				}

				btnLeft.css({
					'left': btnLeftOffset + 'px'
				});

				btnRight.css({
					'left': btnRightOffset + 'px'
				});

				if (scrollTop < holderTop || scrollTop > holderBottom) {
					btnWrap.removeClass('show-arrow');
					loadWrapp.addClass('hidden-loader');
				} else {
					btnWrap.addClass('show-arrow');
					loadWrapp.removeClass('hidden-loader');
				}

			};

			$this.find('.wromox-products-load-prev, .wromox-products-load-next').off('click').on('click', function (e) {

				e.preventDefault();

				if (process || $(this).hasClass('disabled')) return; process = true;

				clearInterval(intervalID);

				var $this = $(this),
					holder = $this.parent().parent().prev(),
					next = $this.parent().find('.wromox-products-load-next'),
					prev = $this.parent().find('.wromox-products-load-prev'),
					atts = holder.data('atts'),
					action = 'wromox_get_products_shortcode',
					ajaxurl = wromox_settings.ajaxurl,
					dataType = 'json',
					method = 'POST',
					paged = holder.attr('data-paged');

				paged++;

				if ($this.hasClass('wromox-products-load-prev')) {
					if (paged < 2) return;
					paged = paged - 2;
				}

				loadProducts('arrows', atts, ajaxurl, action, dataType, method, paged, holder, $this, cache, function (data) {
					var isBorderedGrid = holder.hasClass('products-bordered-grid');

					if (!isBorderedGrid) {
						holder.addClass('wromox-animated-products');
					}

					if (data.items) {
						holder.html(data.items).attr('data-paged', paged);
						holder.imagesLoaded().progress(function () {
							holder.parent().trigger('recalc');
						});

						$(document).trigger('wood-images-loaded');

						wromoxThemeModule.productHover();
						wromoxThemeModule.btnsToolTips();
						wromoxThemeModule.productMoreDescription();
						wromoxThemeModule.gridQuantity();
					}

					if ($(window).width() < 768) {
						$('html, body').stop().animate({
							scrollTop: holder.offset().top - 150
						}, 400);
					}

					if (!isBorderedGrid) {
						var iter = 0;
						intervalID = setInterval(function () {
							holder.find('.product-grid-item').eq(iter).addClass('wromox-animated');
							iter++;
						}, 100);
					}

					if (paged > 1) {
						prev.removeClass('disabled');
					} else {
						prev.addClass('disabled');
					}

					if (data.status == 'no-more-posts') {
						next.addClass('disabled');
					} else {
						next.removeClass('disabled');
					}
				});

			});
		});


		wromoxThemeModule.clickOnScrollButton(wromoxTheme.shopLoadMoreBtn, false, wromox_settings.infinit_scroll_offset);

		$(document).off('click', '.wromox-products-load-more').on('click', '.wromox-products-load-more', function (e) {
			e.preventDefault();

			if (process) return; process = true;

			var $this = $(this),
				holder = $this.parent().siblings('.wromox-products-holder'),
				source = holder.data('source'),
				action = 'wromox_get_products_' + source,
				ajaxurl = wromox_settings.ajaxurl,
				dataType = 'json',
				method = 'POST',
				atts = holder.data('atts'),
				paged = holder.data('paged');

			paged++;

			if (source == 'main_loop') {
				ajaxurl = $(this).attr('href');
				method = 'GET';
			}

			loadProducts('load-more', atts, ajaxurl, action, dataType, method, paged, holder, $this, [], function (data) {
				if (data.items) {
					if (holder.hasClass('grid-masonry')) {
						isotopeAppend(holder, data.items);
					} else {
						holder.append(data.items);
					}

					holder.imagesLoaded().progress(function () {
						wromoxThemeModule.clickOnScrollButton(wromoxTheme.shopLoadMoreBtn, true, wromox_settings.infinit_scroll_offset);
					});

					$(document).trigger('wood-images-loaded');

					holder.data('paged', paged);

					wromoxThemeModule.productHover();
					wromoxThemeModule.btnsToolTips();
					wromoxThemeModule.productMoreDescription();
					wromoxThemeModule.gridQuantity();
				}

				if (source == 'main_loop') {
					$this.attr('href', data.nextPage);
					if (data.status == 'no-more-posts') {
						$this.hide().remove();
					}
				}

				if (data.status == 'no-more-posts') {
					$this.hide();
				}
			});

		});

		var loadProducts = function (btnType, atts, ajaxurl, action, dataType, method, paged, holder, btn, cache, callback) {
			var data = {
				atts: atts,
				paged: paged,
				action: action,
				woo_ajax: 1,
			};

			if (cache[paged]) {
				holder.addClass('loading');
				setTimeout(function () {
					callback(cache[paged]);
					holder.removeClass('loading');
					process = false;
				}, 300);
				return;
			}

			if (btnType == 'arrows') holder.addClass('loading').parent().addClass('element-loading');

			btn.addClass('loading');

			if (action == 'wromox_get_products_main_loop') {
				var loop = holder.find('.product').last().data('loop');
				data = {
					loop: loop,
					woo_ajax: 1
				};
			}

			$.ajax({
				url: ajaxurl,
				data: data,
				dataType: dataType,
				method: method,
				success: function (data) {
					cache[paged] = data;
					callback(data);
				},
				error: function (data) {
					console.log('ajax error');
				},
				complete: function () {
					if (btnType == 'arrows') holder.removeClass('loading').parent().removeClass('element-loading');
					btn.removeClass('loading');
					process = false;
					wromoxThemeModule.compare();
					wromoxThemeModule.productHover();
					wromoxThemeModule.countDownTimer();
					wromoxThemeModule.productMoreDescription();
					wromoxThemeModule.gridQuantity();
				},
			});
		};

		var isotopeAppend = function (el, items) {
			// initialize Masonry after all images have loaded
			var items = $(items);
			el.append(items).isotope('appended', items);
			el.imagesLoaded().progress(function () {
				el.isotope('layout');
			});
		};
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Compare button
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.compare = function () {
		var body = $("body"),
			button = $("a.compare");

		body.on("click", "a.compare", function () {
			$(this).addClass("loading");
		});

		body.on("yith_woocompare_open_popup", function () {
			button.removeClass("loading");
			body.addClass("compare-opened");
		});

		body.on('click', '#cboxClose, #cboxOverlay', function () {
			body.removeClass("compare-opened");
		});
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * WroMox compare functions
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.wromoxCompare = function () {
		var cookiesName = 'wromox_compare_list';

		if (wromox_settings.is_multisite) {
			cookiesName += '_' + wromox_settings.current_blog_id;
		}

		var $body = $("body"),
			$widget = $('.wromox-compare-info-widget'),
			compareCookie = Cookies.get(cookiesName);

		if ($widget.length > 0 && 'undefined' !== typeof compareCookie) {
			try {
				var ids = JSON.parse(compareCookie);
				$widget.find('.compare-count').text(ids.length);
			} catch (e) {
				console.log('cant parse cookies json');
			}
		}
		// Add to compare action

		$body.on('click', '.wromox-compare-btn a', function (e) {
			var $this = $(this),
				id = $this.data('id'),
				addedText = $this.data('added-text');

			if ($this.hasClass('added')) return true;

			e.preventDefault();

			$this.addClass('loading');

			jQuery.ajax({
				url: wromox_settings.ajaxurl,
				data: {
					action: 'wromox_add_to_compare',
					id: id,
				},
				dataType: 'json',
				method: 'GET',
				success: function (response) {
					if (response.table) {
						updateCompare(response);
						$(document).trigger('added_to_compare');
					} else {
						console.log('something wrong loading compare data ', response);
					}
				},
				error: function (data) {
					console.log('We cant add to compare. Something wrong with AJAX response. Probably some PHP conflict.');
				},
				complete: function () {
					$this.removeClass('loading').addClass('added');

					if ($this.find('span').length > 0) {
						$this.find('span').text(addedText);
					} else {
						$this.text(addedText);
					}
			},
			});

		});

		// Remove from compare action

		$body.on('click', '.wromox-compare-remove', function (e) {
			e.preventDefault();
			var $this = $(this),
				id = $this.data('id');

			$this.addClass('loading');

			jQuery.ajax({
				url: wromox_settings.ajaxurl,
				data: {
					action: 'wromox_remove_from_compare',
					id: id,
				},
				dataType: 'json',
				method: 'GET',
				success: function (response) {
					if (response.table) {
						updateCompare(response);
					} else {
						console.log('something wrong loading compare data ', response);
					}
				},
				error: function (data) {
					console.log('We cant remove product compare. Something wrong with AJAX response. Probably some PHP conflict.');
				},
				complete: function () {
					$this.addClass('loading');
				},
			});

		});

		// Elements update after ajax

		function updateCompare(data) {
			if ($widget.length > 0) {
				$widget.find('.compare-count').text(data.count);
			}

			if ($('.wromox-compare-table').length > 0) {
				$('.wromox-compare-table').replaceWith(data.table);
			}

		}

	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Add class in wishlist
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.wishList = function () {
		var body = $("body");

		body.on("click", ".add_to_wishlist", function () {

			$(this).parent().addClass("feid-in");

		});
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Product 360 button
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.product360Button = function () {
		$('.product-360-button a').magnificPopup({
			type: 'inline',
			mainClass: 'mfp-fade',
			// removalDelay: 500, //delay removal by X to allow out-animation
			// callbacks: {
			//     beforeOpen: function() {
			//         this.st.mainClass = wromoxTheme.popupEffect;
			//     }
			// },
			preloader: false,
			tClose: wromox_settings.close,
			tLoading: wromox_settings.loading,
			fixedContentPos: false,
			callbacks: {
				open: function () {
					$(window).resize()
				},
			},
		});
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Product video button
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.productVideo = function () {
		$('.product-video-button a').magnificPopup({
			tClose: wromox_settings.close,
			tLoading: wromox_settings.loading,
			type: 'iframe',
			iframe: {
				patterns: {
					youtube: {
						index: 'youtube.com/',
						id: 'v=',
						src: '//www.youtube.com/embed/%id%?rel=0&autoplay=1'
					}
				}
			},
			preloader: false,
			fixedContentPos: false
		});
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Login tabs for my account page
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.loginTabs = function () {
		var tabs = $('.wromox-register-tabs'),
			btn = tabs.find('.wromox-switch-to-register'),
			title = $('.col-register-text h2'),
			login = tabs.find('.col-login'),
			loginText = tabs.find('.login-info'),
			register = tabs.find('.col-register'),
			classOpened = 'active-register',
			loginLabel = btn.data('login'),
			registerLabel = btn.data('register'),
			loginTitleLabel = btn.data('login-title'),
			registerTitleLabel = btn.data('reg-title');

		btn.on('click', function (e) {
			e.preventDefault();

			if (isShown()) {
				hideRegister();
			} else {
				showRegister();
			}

			var scrollTo = $('.main-page-wrapper').offset().top - 100;

			if ($(window).width() < 768) {
				$('html, body').stop().animate({
					scrollTop: tabs.offset().top - 90
				}, 400);
			}
		});

		var showRegister = function () {
			tabs.addClass(classOpened);
			btn.text(loginLabel);
			if (loginText.length > 0) {
				title.text(loginTitleLabel);
			}
		};

		var hideRegister = function () {
			tabs.removeClass(classOpened);
			btn.text(registerLabel);
			if (loginText.length > 0) {
				title.text(registerTitleLabel);
			}
		};

		var isShown = function () {
			return tabs.hasClass(classOpened);
		};
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Header Categories menu for mobile
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.headerCategoriesMenu = function () {
		if ($(window).width() > 1024) return;

		var categories = $('.header-categories-nav'),
			catsUl = categories.find('.categories-menu-dropdown'),
			subCategories = categories.find('.menu-item-has-children'),
			button = categories.find('.menu-opener'),
			time = 200,
			iconDropdown = '<span class="drop-category"></span>';

		subCategories.find('> a').before(iconDropdown);

		catsUl.on('click', '.drop-category', function () {
			var sublist = $(this).parent().find('> .sub-menu-dropdown, >.sub-sub-menu');
			if (sublist.hasClass('child-open')) {
				$(this).removeClass("act-icon");
				sublist.slideUp(time).removeClass('child-open');
			} else {
				$(this).addClass("act-icon");
				sublist.slideDown(time).addClass('child-open');
			}
		});

		categories.on('click', '.menu-opener', function (e) {
			e.preventDefault();

			if (isOpened()) {
				closeCats();
			} else {
				//setTimeout(function() {
				openCats();
				//}, 50);
			}
		});

		catsUl.on('click', 'a', function (e) {
			closeCats();
			catsUl.stop().attr('style', '');
		});

		var isOpened = function () {
			return catsUl.hasClass('categories-opened');
		};

		var openCats = function () {
			catsUl.addClass('categories-opened').stop().slideDown(time);
			button.addClass('button-open');

		};

		var closeCats = function () {
			catsUl.removeClass('categories-opened').stop().slideUp(time);
			button.removeClass('button-open');
		};
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Categories menu for mobile
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.categoriesMenu = function () {
		if ($(window).width() > 1024) return;

		var categories = $('.wromox-product-categories'),
			subCategories = categories.find('li > ul'),
			button = $('.wromox-show-categories'),
			time = 200;

		//this.categoriesMenuBtns();

		$('body').on('click', '.icon-drop-category', function (e) {
			e.preventDefault();

			if ($(this).closest('.has-sub').find('> ul').hasClass('child-open')) {
				$(this).removeClass("wromox-act-icon").closest('.has-sub').find('> ul').slideUp(time).removeClass('child-open');
			} else {
				$(this).addClass("wromox-act-icon").closest('.has-sub').find('> ul').slideDown(time).addClass('child-open');
			}
		});

		$('body').on('click', '.wromox-show-categories', function (e) {
			e.preventDefault();

			if (isOpened()) {
				closeCats();
			} else {
				//setTimeout(function() {
				openCats();
				//}, 50);
			}
		});

		$('body').on('click', '.wromox-product-categories a', function (e) {
			if (!$(e.target).hasClass('icon-drop-category')) {
				closeCats();
				categories.stop().attr('style', '');
			}
		});

		var isOpened = function () {
			return $('.wromox-product-categories').hasClass('categories-opened');
		};

		var openCats = function () {
			$('.wromox-product-categories').addClass('categories-opened').stop().slideDown(time);
			$('.wromox-show-categories').addClass('button-open');

		};

		var closeCats = function () {
			$('.wromox-product-categories').removeClass('categories-opened').stop().slideUp(time);
			$('.wromox-show-categories').removeClass('button-open');
		};
	};

	wromoxThemeModule.categoriesMenuBtns = function () {
		if ($(window).width() > 1024) return;

		var categories = $('.wromox-product-categories'),
			subCategories = categories.find('li > ul'),
			iconDropdown = '<span class="icon-drop-category"></span>';

		categories.addClass('responsive-cateogires');
		subCategories.parent().addClass('has-sub').find('> .category-nav-link').prepend(iconDropdown);
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Filters area
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.filtersArea = function () {
		var filters = $('.filters-area'),
			btn = $('.open-filters'),
			time = 200;

		$('body').on('click', '.open-filters', function (e) {
			e.preventDefault();

			if (isOpened()) {
				closeFilters();
			} else {
				wromoxThemeModule.openFilters(time);
				setTimeout(function () {
					wromoxThemeModule.shopLoader();
				}, time);
			}

		});

		if (wromox_settings.shop_filters_close == 'no') {
			$('body').on('click', wromoxTheme.ajaxLinks, function () {
				if (isOpened()) {
					closeFilters();
				}
			});
		}

		var isOpened = function () {
			filters = $('.filters-area')
			return filters.hasClass('filters-opened');
		};

		var closeFilters = function () {
			filters = $('.filters-area')
			filters.removeClass('filters-opened');
			filters.stop().slideUp(time);
			$('.open-filters').removeClass('btn-opened');
		};
	};

	wromoxThemeModule.openFilters = function (time) {
		var filters = $('.filters-area')
		filters.stop().slideDown(time);
		$('.open-filters').addClass('btn-opened');
		setTimeout(function () {
			filters.addClass('filters-opened');
			$('body').removeClass('body-filters-opened');
			wromoxThemeModule.nanoScroller();
			$(document).trigger('wood-images-loaded');
		}, time);
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Init shop page JS functions
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.shopPageInit = function () {
		wromoxThemeModule.shopMasonry();
		wromoxThemeModule.ajaxSearch();
		wromoxThemeModule.productHover();
		wromoxThemeModule.btnsToolTips();
		wromoxThemeModule.compare();
		wromoxThemeModule.filterDropdowns();
		wromoxThemeModule.sortByWidget();
		wromoxThemeModule.categoriesMenuBtns();
		wromoxThemeModule.categoriesAccordion();
		wromoxThemeModule.woocommercePriceSlider();
		wromoxThemeModule.countDownTimer();
		wromoxThemeModule.nanoScroller();
		wromoxThemeModule.shopLoader();
		wromoxThemeModule.stickySidebarBtn();
		wromoxThemeModule.productFilters();
		wromoxThemeModule.productMoreDescription();
		wromoxThemeModule.gridQuantity();
		wromoxThemeModule.swatchesLimit();
		wromoxThemeModule.categoriesDropdowns();

		wromoxThemeModule.clickOnScrollButton(wromoxTheme.shopLoadMoreBtn, false, wromox_settings.infinit_scroll_offset);

		// Bootstrap tooltips reset

		$('body > .tooltip').remove();

		$(document.body).on('updated_wc_div', function () {
			$(document).trigger('wood-images-loaded');
		});

		$(document).trigger('resize.vcRowBehaviour');
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Ajax filters
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.ajaxFilters = function () {
		if (!$('body').hasClass('wromox-ajax-shop-on') || typeof ($.fn.pjax) == 'undefined' || $('body').hasClass('single-product')) {
			return;
		}

		var that = this,
			filtersState = false,
			products = $('.products');

		$('body').on('click', '.post-type-archive-product .products-footer .woocommerce-pagination a', function (e) {
			scrollToTop(true);
		});

		$(document).pjax(wromoxTheme.ajaxLinks, '.main-page-wrapper', {
			timeout: wromox_settings.pjax_timeout,
			scrollTo: false
		});

		if (wromox_settings.price_filter_action == 'click') {
			$(document).on('click', '.widget_price_filter form .button', function () {
				var form = $('.widget_price_filter form');
				$.pjax({
					container: '.main-page-wrapper',
					timeout: wromox_settings.pjax_timeout,
					url: form.attr('action'),
					data: form.serialize(),
					scrollTo: false
				});

				return false;
			});
		} else if (wromox_settings.price_filter_action == 'submit') {
			$(document).on('submit', '.widget_price_filter form', function (event) {
				var container = $('.main-page-wrapper');
				$.pjax.submit(event, container);
			});
		}

		$(document).on('pjax:error', function (xhr, textStatus, error, options) {
			console.log('pjax error ' + error);
		});

		$(document).on('pjax:start', function (xhr, options) {
			$('.site-content').removeClass('ajax-loaded');
			$('.site-content').addClass('ajax-loading');
			wromoxThemeModule.hideShopSidebar();
		});

		$(document).on('pjax:complete', function (xhr, textStatus, options) {

			that.shopPageInit();
			scrollToTop(false);

			$(document).trigger('wood-images-loaded');

			$('.wromox-sidebar-content').scroll(function () {
				$(document).trigger('wood-images-loaded');
			})

			$('.site-content').removeClass('ajax-loading');

			if ( typeof wromox_wpml_js_data !== 'undefined' && wromox_wpml_js_data.languages ) {
				$.each(wromox_wpml_js_data.languages, function(index, language) {
					$('.wpml-ls-item-' + language.code + ' .wpml-ls-link').attr('href', language.url);
				});
			}
		});

		$(document).on('pjax:beforeReplace', function (contents, options) {
			if ($('.filters-area').hasClass('filters-opened') && wromox_settings.shop_filters_close == 'yes') {
				filtersState = true;
				$('body').addClass('body-filters-opened');
			}
		});

		$(document).on('pjax:end', function (xhr, textStatus, options) {
			if (filtersState) {
				$('.filters-area').css('display', 'block');
				wromoxThemeModule.openFilters(200);
				filtersState = false;
			}
			$('.site-content').removeClass('ajax-loading');
			$('.site-content').addClass('ajax-loaded');
		});

		var scrollToTop = function (type) {
			if (wromox_settings.ajax_scroll == 'no' && type == false) return false;

			var $scrollTo = $(wromox_settings.ajax_scroll_class),
				scrollTo = $scrollTo.offset().top - wromox_settings.ajax_scroll_offset;

			$('html, body').stop().animate({
				scrollTop: scrollTo
			}, 400);
		};
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Side shopping cart widget
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.cartWidget = function () {
		var widget = $('.cart-widget-opener'),
			btn = widget.find('a'),
			body = $('body');

		var cartWidgetSide = $('.cart-widget-side');
		var closeSide = $('.wromox-close-side');

		widget.on('click', function (e) {
			if (!isCart() && !isCheckout()) e.preventDefault();

			if (isOpened()) {
				closeWidget();
			} else {
				setTimeout(function () {
					openWidget();
				}, 10);
			}

		});

		body.on("click touchstart", ".wromox-close-side", function () {
			if (isOpened()) {
				closeWidget();
			}
		});

		body.on("click", ".close-side-widget", function (e) {
			e.preventDefault();
			if (isOpened()) {
				closeWidget();
			}
		});

		$(document).keyup(function (e) {
			if (e.keyCode === 27 && isOpened()) closeWidget();
		});

		var closeWidget = function () {
			cartWidgetSide.removeClass('wromox-cart-opened');
			closeSide.removeClass('wromox-close-side-opened');
		};

		var openWidget = function () {
			if (isCart() || isCheckout()) return false;
			cartWidgetSide.addClass('wromox-cart-opened');
			closeSide.addClass('wromox-close-side-opened');
		};

		var isOpened = function () {
			return cartWidgetSide.hasClass('wromox-cart-opened');
		};

		var isCart = function () {
			return $('body').hasClass('woocommerce-cart');
		};

		var isCheckout = function () {
			return $('body').hasClass('woocommerce-checkout');
		};
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Quantityt +/-
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.woocommerceQuantity = function () {
		if (!String.prototype.getDecimals) {
			String.prototype.getDecimals = function () {
				var num = this,
					match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
				if (!match) {
					return 0;
				}
				return Math.max(0, (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0));
			}
		}

		$(document).on('click', '.plus, .minus', function () {
			// Get values
			var $qty = $(this).closest('.quantity').find('.qty'),
				currentVal = parseFloat($qty.val()),
				max = parseFloat($qty.attr('max')),
				min = parseFloat($qty.attr('min')),
				step = $qty.attr('step');

			// Format values
			if (!currentVal || currentVal === '' || currentVal === 'NaN') currentVal = 0;
			if (max === '' || max === 'NaN') max = '';
			if (min === '' || min === 'NaN') min = 0;
			if (step === 'any' || step === '' || step === undefined || parseFloat(step) === 'NaN') step = '1';

			// Change the value
			if ($(this).is('.plus')) {
				if (max && (currentVal >= max)) {
					$qty.val(max);
				} else {
					$qty.val((currentVal + parseFloat(step)).toFixed(step.getDecimals()));
				}
			} else {
				if (min && (currentVal <= min)) {
					$qty.val(min);
				} else if (currentVal > 0) {
					$qty.val((currentVal - parseFloat(step)).toFixed(step.getDecimals()));
				}
			}

			// Trigger change event
			$qty.trigger('change');
		});
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * On remove from cart widget
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.onRemoveFromCart = function () {
		if ( 'no' === wromox_settings.woocommerce_ajax_add_to_cart ) {
			return;
		}

		$(document).on('click', '.widget_shopping_cart .remove', function (e) {
			e.preventDefault();
			$(this).parent().addClass('removing-process');
		});
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Fix comments
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.woocommerceComments = function () {
		var hash = window.location.hash;
		var url = window.location.href;

		if (hash.toLowerCase().indexOf('comment-') >= 0 || hash === '#reviews' || hash === '#tab-reviews' || url.indexOf('comment-page-') > 0 || url.indexOf('cpage=') > 0) {

			setTimeout(function () {
				window.scrollTo(0, 0);
			}, 1);

			setTimeout(function () {
				if ($(hash).length > 0) {
					$('html, body').stop().animate({
						scrollTop: $(hash).offset().top - 100
					}, 400);
				}
			}, 10);

		}
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Mobile responsive navigation
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.woocommerceWrappTable = function () {
		var wooTable = $(".shop_table:not(.shop_table_responsive):not(.woocommerce-checkout-review-order-table)").wrap("<div class='responsive-table'></div>");
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Product loder position
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.productLoaderPosition = function () {
		var recalc = function () {
			$('.wromox-products-loader').each(function () {
				var $loader = $(this),
					$loaderWrap = $loader.parent();

				if ($loader.length == 0) return;

				$loader.css('left', $loaderWrap.offset().left + $loaderWrap.outerWidth() / 2);
			});
		};

		$(window).on('resize', recalc);

		recalc();
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Init Zoom
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.initZoom = function () {
		var $mainGallery = $('.woocommerce-product-gallery__wrapper:not(.quick-view-gallery)');

		if (wromox_settings.zoom_enable != 'yes') {
			return false;
		}

		var zoomOptions = {
			touch: false
		};

		if ('ontouchstart' in window) {
			zoomOptions.on = 'click';
		}

		if ( $('.woocommerce-product-gallery').hasClass('thumbs-position-bottom') || $('.woocommerce-product-gallery').hasClass('thumbs-position-left') ) {
			$mainGallery.on('changed.owl.carousel', function(e){
				var $wrapper = $mainGallery.find('.product-image-wrap').eq(e.item.index).find('.woocommerce-product-gallery__image');

				init($wrapper);
			});
		} else {
			$mainGallery.find('.product-image-wrap').each(function () {
				var $wrapper = $(this).find('.woocommerce-product-gallery__image');

				init($wrapper);
			});
		}

		function init($wrapper){
			var image = $wrapper.find('img');

			if (image.data('large_image_width') > $wrapper.width()) {
				$wrapper.trigger('zoom.destroy');
				$wrapper.zoom(zoomOptions);
			}
		}
	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Product Hover
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */
	wromoxThemeModule.productMoreDescription = function ()  {
		$('.wromox-more-desc').each(function () {
			var btnHTML = '<a href="#" class="wromox-more-desc-btn"><span>' + 'more' + '</span></a>';
			var $content = $(this);
			var $inner = $content.find('.wromox-more-desc-inner');
			var contentHeight = $content.outerHeight();
			var innerHeight = $inner.outerHeight();
			var delta = innerHeight - contentHeight;

			if ($content.hasClass('wromox-more-desc-active')) {
				return;
			}

			if (delta > 30) {
				$content.addClass('wromox-more-desc-active');
				$content.append(btnHTML);
			} else if (delta > 0) {
				$content.css('height', contentHeight + delta);
			}
		});

		$('body').on('click', '.wromox-more-desc-btn', function (e) {
			e.preventDefault();
			$(this).parent().addClass('wromox-more-desc-full');

			wromoxThemeModule.productHoverRecalc($(this).parents('.wromox-hover-base'));
		});
	};

	wromoxThemeModule.productHoverRecalc = function ($el) {
		if ($el.hasClass('product-in-carousel')) {
			return;
		}

		var heightHideInfo = $el.find('.fade-in-block').outerHeight();

		$el.find('.content-product-imagin').css({
			marginBottom: -heightHideInfo
		});

		$el.addClass('hover-ready');
	};

	wromoxThemeModule.productHover = function () {
		$('.wromox-hover-base').each(function () {
			var $product = $(this);

			$product.imagesLoaded(function () {
				wromoxThemeModule.productHoverRecalc($product);
			});
		});

		if ($(window).width() <= 1024) {
			$('.wromox-hover-base').on('click', function (e) {
				var hoverClass = 'state-hover';
				if (!$(this).hasClass(hoverClass) && wromox_settings.base_hover_mobile_click == 'no') {
					e.preventDefault();
					$('.' + hoverClass).removeClass(hoverClass);
					$(this).addClass(hoverClass);
				}
			});
			$(document).on('click touchstart', function (e) {
				if ($(e.target).closest('.state-hover').length == 0) {
					$('.state-hover').removeClass('state-hover');
				}
			});
		}

		$('.wromox-hover-base').each(function () {
			var $el = $(this),
				$elBtn = $el.find('.wromox-add-btn'),
				widthHiddenInfo = $el.outerWidth();

			if (!wromox_settings.hover_width_small) {
				return;
			}

			if (widthHiddenInfo < 255 || $(window).width() <= 1024) {
				$el.addClass('add-small-content');

				if ($el.hasClass('wromox-hover-base')) {
					$elBtn.addClass('wd-action-btn wd-add-cart-btn wd-style-icon');
				}
			} else {
				if ($el.hasClass('wromox-hover-base') && ($('body').hasClass('catalog-mode-on') || $('body').hasClass('login-see-prices'))) {
					$el.find('.wd-bottom-actions .wd-action-btn').removeClass('wd-style-icon').addClass('wd-style-text');
				}
			}
		});
	};
	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Enable masonry grid for shop isotope type
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */
	wromoxThemeModule.shopMasonry = function () {

		if (typeof ($.fn.isotope) == 'undefined' || typeof ($.fn.packery) == 'undefined' || typeof ($.fn.imagesLoaded) == 'undefined') return;
		var $container = $('.elements-grid.grid-masonry');
		// initialize Masonry after all images have loaded
		$container.imagesLoaded(function () {
			$container.isotope({
				isOriginLeft: !$('body').hasClass('rtl'),
				itemSelector: '.category-grid-item, .product-grid-item',
			});
		});

		// Categories masonry
		$(window).resize(function () {
			var $catsContainer = $('.categories-masonry');
			var colWidth = ($catsContainer.hasClass('categories-style-masonry')) ? '.category-grid-item' : '.col-lg-3.category-grid-item';
			$catsContainer.imagesLoaded(function () {
				$catsContainer.packery({
					resizable: false,
					isOriginLeft: !$('body').hasClass('rtl'),
					// layoutMode: 'packery',
					packery: {
						gutter: 0,
						columnWidth: colWidth
					},
					itemSelector: '.category-grid-item',
					// masonry: {
					// gutter: 0
					// }
				});
			});
		});

	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * Categories toggle accordion
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */
	wromoxThemeModule.categoriesAccordion = function () {

		if (wromox_settings.categories_toggle == 'no') return;

		var $widget = $('.widget_product_categories'),
			$list = $widget.find('.product-categories'),
			time = 300;

		$list.find('.cat-parent').each(function () {
			if ($(this).find(' > .wromox-cats-toggle').length > 0) return;
			if ($(this).find(' > .children').length == 0 || $(this).find(' > .children > *').length == 0) return;
			$(this).append('<div class="wromox-cats-toggle"></div>');
		});

		$list.on('click', '.wromox-cats-toggle', function () {
			var $btn = $(this),
				$subList = $btn.prev();

			if ($subList.hasClass('list-shown')) {
				$btn.removeClass('toggle-active');
				$subList.stop().slideUp(time).removeClass('list-shown');
			} else {
				$subList.parent().parent().find('> li > .list-shown').slideUp().removeClass('list-shown');
				$subList.parent().parent().find('> li > .toggle-active').removeClass('toggle-active');
				$btn.addClass('toggle-active');
				$subList.stop().slideDown(time).addClass('list-shown');
			}
		});

		if ($list.find('li.current-cat.cat-parent, li.current-cat-parent').length > 0) {
			$list.find('li.current-cat.cat-parent, li.current-cat-parent').find('> .wromox-cats-toggle').click();
		}

	};

	/**
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 * WooCommerce price filter slider with ajax
	 *-------------------------------------------------------------------------------------------------------------------------------------------
	 */

	wromoxThemeModule.woocommercePriceSlider = function () {

		// woocommerce_price_slider_params is required to continue, ensure the object exists
		if (typeof woocommerce_price_slider_params === 'undefined' || $('.price_slider_amount #min_price').length < 1 || !$.fn.slider) {
			return false;
		}

		var $slider = $('.price_slider');

		if ($slider.slider('instance') !== undefined) return;

		// Get markup ready for slider
		$('input#min_price, input#max_price').hide();
		$('.price_slider, .price_label').show();

		// Price slider uses $ ui
		var min_price = $('.price_slider_amount #min_price').data('min'),
			max_price = $('.price_slider_amount #max_price').data('max'),
			current_min_price = parseInt(min_price, 10),
			current_max_price = parseInt(max_price, 10);

		if ($('.products').attr('data-min_price') && $('.products').attr('data-min_price').length > 0) {
			current_min_price = parseInt($('.products').attr('data-min_price'), 10);
		}
		if ($('.products').attr('data-max_price') && $('.products').attr('data-max_price').length > 0) {
			current_max_price = parseInt($('.products').attr('data-max_price'), 10);
		}

		$slider.slider({
			range: true,
			animate: true,
			min: min_price,
			max: max_price,
			values: [current_min_price, current_max_price],
			create: function () {

				$('.price_slider_amount #min_price').val(current_min_price);
				$('.price_slider_amount #max_price').val(current_max_price);

				$(document.body).trigger('price_slider_create', [current_min_price, current_max_price]);
			},
			slide: function (event, ui) {

				$('input#min_price').val(ui.values[0]);
				$('input#max_price').val(ui.values[1]);

				$(document.body).trigger('price_slider_slide', [ui.values[0], ui.values[1]]);
			},
			change: function (event, ui) {

				$(document.body).trigger('price_slider_change', [ui.values[0], ui.values[1]]);
			}
		});

		setTimeout(function () {
			$(document.body).trigger('price_slider_create', [current_min_price, current_max_price]);
			if ($slider.find('.ui-slider-range').length > 1) $slider.find('.ui-slider-range').first().remove();
		}, 10);
	};

})(jQuery);

jQuery(window).on('elementor/frontend/init', function() {
	if (!elementorFrontend.isEditMode()) {
		return;
	}

	elementorFrontend.hooks.addAction('frontend/element_ready/wd_products.default', function($wrapper, $) {
		wromoxThemeModule.swatchesOnGrid();
		wromoxThemeModule.quickViewInit();
		wromoxThemeModule.quickShop();
		wromoxThemeModule.btnsToolTips();
		wromoxThemeModule.countDownTimer();
		wromoxThemeModule.addToCart();
		wromoxThemeModule.owlCarouselInit();
		wromoxThemeModule.lazyLoading();
		wromoxThemeModule.productHover();
		wromoxThemeModule.productMoreDescription();
		wromoxThemeModule.gridQuantity();
		wromoxThemeModule.shopMasonry();
		wromoxThemeModule.productsLoadMore();
	});

	elementorFrontend.hooks.addAction('frontend/element_ready/wd_products_tabs.default', function($wrapper, $) {
		wromoxThemeModule.productsTabs();
		wromoxThemeModule.swatchesOnGrid();
		wromoxThemeModule.quickViewInit();
		wromoxThemeModule.quickShop();
		wromoxThemeModule.btnsToolTips();
		wromoxThemeModule.countDownTimer();
		wromoxThemeModule.addToCart();
		wromoxThemeModule.owlCarouselInit();
		wromoxThemeModule.lazyLoading();
		wromoxThemeModule.productHover();
		wromoxThemeModule.productMoreDescription();
		wromoxThemeModule.gridQuantity();
		wromoxThemeModule.shopMasonry();
		wromoxThemeModule.productsLoadMore();
	});

	elementorFrontend.hooks.addAction('frontend/element_ready/wd_product_categories.default', function($wrapper, $) {
		wromoxThemeModule.owlCarouselInit();
		wromoxThemeModule.lazyLoading();
	});

	elementorFrontend.hooks.addAction('frontend/element_ready/wd_products_brands.default', function($wrapper, $) {
		wromoxThemeModule.owlCarouselInit();
		wromoxThemeModule.lazyLoading();
		wromoxThemeModule.shopMasonry();
	});

	elementorFrontend.hooks.addAction('frontend/element_ready/wd_product_filters.default', function($wrapper, $) {
		wromoxThemeModule.productFilters();
	});

});

jQuery(document).ready(function () {
	wromoxThemeModule.init();
}); 
