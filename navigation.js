(function ( $ ) {
    'use strict';

    var Navigation = function(navElement, options) {
        var navigationElement = $(navElement);
        var switchButton;

        var settings = $.extend(true, {
            supportSwitch: true,
            supportOpenSubNav: true,
            supportLinkFocus: true,
            supportMobileSwitchRules: true,
            elements: {
                switchButton: navigationElement.find('.header-nav-switcher')
            },
            selectors: {
                element: '.hn-nav-item',
                link: 'a',
                subNav: '.hn-subnav'

            },
            classes: {
                openNav: 'open-nav',
                linkFocus: 'link-focus',
                openSubNav: 'open-sub-nav'
            },
            elementsClasses: {
                onOpenNav: {}, //make { className: [element, element, ...], secondClassName: [element, ...]}
                onFocusLink: {},
                onOpenSubNav: {}
            },
            rules: {
                canOpenNav: function() { return true; },
                canFocusLink: function() { return true; },
                canOpenSubNav: function() { return true; }
            }

        }, options);

        var linksElements = navigationElement.find(settings.selectors.element + ' ' + settings.selectors.link);

        //Support switch initialized
        if(isSupportSwitch()) {
            switchButton = $(settings.elements.switchButton);

            if(switchButton.length > 0) {
                settings.elementsClasses.onOpenNav = makeJQueryElements(settings.elementsClasses.onOpenNav);

                switchButton.on('click', function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    if(!isNavOpen() && settings.rules.canOpenNav()) {
                        openNav();
                    } else {
                        closeNav();
                    }
                });
            } else {
                settings.supportSwitch = false;
            }
        }

        //Support links focus initialized
        if(isSupportLinkFocus()) {
            settings.elementsClasses.onFocusLink = makeJQueryElements(settings.elementsClasses.onFocusLink);

            linksElements.on('focusin', function() {
                if(canAddLinkFocusClasses()) {
                    linkFocusIn($(this));
                } else {
                    linkFocusOut($(this));
                }
            });

            linksElements.on('focusout', function() {
                linkFocusOut($(this));
            });
        }

        if(isOpenSupportSubNav()) {
            settings.elementsClasses.onOpenSubNav = makeJQueryElements(settings.elementsClasses.onOpenSubNav);

            linksElements.on('click', function(event) {
                var linkElement = $(this);
                if(canOpenSubNav()) {
                    if(hasSubNav(linkElement)) {
                        event.preventDefault();
                        event.stopPropagation();
                        if(isSubNavOpen(linkElement)) {
                            closeSubNav(linkElement);
                        } else {
                            openSubNav(linkElement);
                        }
                    }
                } else {
                    if(hasSubNav(linkElement)) {
                        closeSubNav(linkElement);
                    }
                }
            });
        }

        //Support mobile switch rules initialized
        if(isSupportMobileSwitchRules()) {
            jQuery(window).resize(function() {
                if(!isSwitchButtonVisible()) {
                    if(isOpenSupportSubNav()) {
                        linksElements.each(function() {
                            closeSubNav($(this));
                        });
                    }

                    closeNav();
                } else if(isSupportLinkFocus()) {
                    linksElements.each(function() {
                        linkFocusOut($(this));
                    });
                }
            });
        }

        //Helpers

        function isNavOpen() {
            return navigationElement.hasClass(settings.classes.openNav);
        }

        function openNav() {
            navigationElement.addClass(settings.classes.openNav);
            addElementsClasses(settings.elementsClasses.onOpenNav);
            navigationElement.trigger('open-nav');
        }

        function closeNav() {
            navigationElement.removeClass(settings.classes.openNav);
            removeElementsClasses(settings.elementsClasses.onOpenNav);
            navigationElement.trigger('close-nav');
        }

        function linkFocusIn(linkElement) {
            linkElement.parents(settings.selectors.element).addClass(settings.classes.linkFocus);
            addElementsClasses(settings.elementsClasses.onFocusLink);
            navigationElement.trigger('link-focusin', [linkElement]);
        }

        function linkFocusOut(linkElement) {
            linkElement.parents(settings.selectors.element).removeClass(settings.classes.linkFocus);
            removeElementsClasses(settings.elementsClasses.onFocusLink);
            navigationElement.trigger('link-focusout', [linkElement]);
        }

        function hasSubNav(linkElement) {
            return linkElement.parents(settings.selectors.element).first().find(settings.selectors.subNav).length > 0;
        }

        function isSubNavOpen(linkElement) {
            return linkElement.parents(settings.selectors.element).first().hasClass(settings.classes.openSubNav);
        }

        function openSubNav(linkElement) {
            linkElement.parents(settings.selectors.element).first().addClass(settings.classes.openSubNav);
            addElementsClasses(settings.elementsClasses.onOpenSubNav);
            navigationElement.trigger('open-sub-nav', [linkElement]);
        }

        function closeSubNav(linkElement) {
            linkElement.parents(settings.selectors.element).first().removeClass(settings.classes.openSubNav);
            removeElementsClasses(settings.elementsClasses.onOpenSubNav);
            navigationElement.trigger('close-sub-nav', [linkElement]);
        }

        function canAddLinkFocusClasses() {
            return isSupportLinkFocus() === true && settings.rules.canFocusLink() === true && (isSupportMobileSwitchRules() === false || (isSupportMobileSwitchRules() === true && !isSwitchButtonVisible()));
        }

        function canOpenSubNav() {
            return isOpenSupportSubNav() === true && settings.rules.canOpenSubNav() === true && (isSupportMobileSwitchRules() === false || (isSupportMobileSwitchRules() === true && isSwitchButtonVisible()));
        }

        function isSupportSwitch() {
            return settings.supportSwitch === true;
        }

        function isSupportMobileSwitchRules() {
            return isSupportSwitch() && settings.supportMobileSwitchRules === true;
        }

        function isSupportLinkFocus() {
            return settings.supportLinkFocus === true;
        }

        function isOpenSupportSubNav() {
            return settings.supportOpenSubNav === true;
        }

        function isSwitchButtonVisible() {
            return switchButton.is(':visible');
        }

        function makeJQueryElements(elements) {
            $.each(elements, function(index, insideElements) {
                $.each(insideElements, function(elementIndex, element) {
                    elements[index][elementIndex] = $(element);
                });
            });

            return elements;
        }

        function addElementsClasses(elements) {
            $.each(elements, function(cssClass, classElements) {
                $.each(classElements, function(elementIndex, element) {
                    element.addClass(cssClass);
                });
            });
        }

        function removeElementsClasses(elements) {
            $.each(elements, function(cssClass, classElements) {
                $.each(classElements, function(elementIndex, element) {
                    element.removeClass(cssClass);
                });
            });
        }
    };

    $.fn.navigation = function() {
        var navigationElements = this;
        var i;

        for (i = 0; i < navigationElements.length; i++) {
            var navigationElement = navigationElements[i];

            if(!(navigationElement.navigation instanceof Navigation)) {
                navigationElement.navigation = new Navigation(navigationElement, arguments[0]);
            }
        }

        return navigationElements;
    };

}( jQuery ));
