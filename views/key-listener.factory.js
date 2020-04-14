const { screen } = require('./screens-config');
const Utils = require('../utils');
const internals = {};

internals.render = screen.render.bind(screen);

exports.KeyListenerFactory = ({ box, actionFn, bgPlain, bgFocus }) => {

    const getHeight = () => box.height - 1;
    const getChildrenLength = () => box.children.length - 1;
    const doChildrenOverlflow = () => getHeight() < getChildrenLength();
    const getNavigationLimit = () => Math.min(box.children.length - 1, getHeight() - 1);
    const setActiveChildColor = (color) => {

        const activeChild = box.children[focusIndexer.get()];
        if (activeChild) {
            activeChild.style.bg = color;
        }
    };
    const focusIndexer = (function makeIndexer() {

        let index = 1;
        return {
            get: () => index,
            incr: () => index < getNavigationLimit() && ++index,
            decr: () => index > 1 && --index
        };
    })();
    const scrollRememberer = (function makeRememberer() {

        let borderHitAndShouldScroll = false;
        return {
            shouldScroll: (direction) => borderHitAndShouldScroll === direction,
            startScroll: (direction) => { borderHitAndShouldScroll = direction; },
            stopScroll: () => { borderHitAndShouldScroll = false; }
        };
    })();

    function navigator(key) {

        if (box.children.length === 1) {
            return;
        }

        const unfocusedIndex = focusIndexer.get();
        const unfocusedChild = box.children[unfocusedIndex];

        if (key === 'k') {
            focusIndexer.decr();
        }
        else if (key === 'l') {
            focusIndexer.incr();
        }

        const focusedIndex = focusIndexer.get();
        const focusedChild = box.children[focusedIndex];

        unfocusedChild.style.bg = bgPlain;
        focusedChild.style.bg = bgFocus;

        internals.render();
    }

    function action({ fromTop } = {}) {

        const index = fromTop ? 1 : focusIndexer.get();
        const child = box.children[index];
        const content = child && child.content;

        if (!content) {
            return {};
        }

        actionFn({
            content,
            index: focusIndexer.get(),
            cb: focusIndexer.decr
        });
        internals.render();

        return { content, index };
    }

    function preFocus() {
        setActiveChildColor(bgFocus);
    }

    function postFocus() {
        setActiveChildColor(bgPlain);
    }

    function changeOrder(key) {

        if (box.children.length === 1) {
            return;
        }

        const index1 = focusIndexer.get();
        const child1 = box.children[index1];

        if (key === 'a') {
            focusIndexer.decr();
        }
        else if (key === 'z') {
            focusIndexer.incr();
        }

        const index2 = focusIndexer.get();
        const child2 = box.children[index2];

        child1.style.bg = bgPlain;
        child2.style.bg = bgFocus;
        [child1.content, child2.content] = [
            `${Utils.firstWord(child1.content)} ${Utils.noFirstWord(child2.content)}`,
            `${Utils.firstWord(child2.content)} ${Utils.noFirstWord(child1.content)}`,
        ];

        internals.render();

        return { index1, index2 };
    }

    function circleList(key) {

        if (box.children.length === 1) {
            return;
        }

        if (key === 'k' && scrollRememberer.shouldScroll('up')) {
            const temp = box.children[box.children.length - 1].content;
            box.children.reduceRight((lowerChild, upperChild) => {

                lowerChild.content = upperChild.content;
                return upperChild;
            });
            box.children[1].content = temp;
        }
        else if (key === 'l' && scrollRememberer.shouldScroll('down')) {
            const temp = box.children[1].content;
            box.children.reduce((upperChild, lowerChild, index) => {

                if (index > 1) {
                    upperChild.content = lowerChild.content;
                }
                return lowerChild;
            });
            box.children[box.children.length - 1].content = temp;
        }
        else if (
            (focusIndexer.get() === 1 && doChildrenOverlflow()) ||
            focusIndexer.get() === getHeight() - 1
        ) {
            scrollRememberer.startScroll(key === 'k' ? 'up' : 'down');
        }
        else {
            scrollRememberer.stopScroll();
        }

        internals.render();
    }

    return Object.freeze({
        navigator,
        action,
        preFocus,
        postFocus,
        ...(box.children[0].content === 'Queue' && { changeOrder }),
        ...(box.children[0].content === 'Playlist' && { circleList })
    });
}

module.exports = exports.KeyListenerFactory;
