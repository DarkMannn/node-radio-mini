const { screen } = require('./screens-config');
const Ut = require('../utils');
const __ = {};

__.render = screen.render.bind(screen);


function KeyListenerFactory({ box, actionFn, bgPlain, bgFocus }) {

    const getNavigationLimit = () => Math.min(box.children.length - 1, getHeight() - 1);
    const getHeight = () => box.height - 1;
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

        box.children[focusIndexer.get()].style.bg = bgPlain;

        if (key === 'k') {
            focusIndexer.decr();
        }
        else if (key === 'l') {
            focusIndexer.incr();
        }

        box.children[focusIndexer.get()].style.bg = bgFocus;

        __.render();
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
        __.render();

        return { content, index };
    }

    function preFocus() {

        if (box.children[focusIndexer.get()]) {
            box.children[focusIndexer.get()].style.bg = bgFocus;
        }
    }
    
    function postFocus() {

        if (box.children[focusIndexer.get()]) {
            (box.children[focusIndexer.get()].style.bg = bgPlain);
        }
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
            `${Ut.firstWord(child1.content)} ${Ut.noFirstWord(child2.content)}`,
            `${Ut.firstWord(child2.content)} ${Ut.noFirstWord(child1.content)}`,
        ];

        __.render();

        return { index1, index2 };
    }

    function circleList(key) {

        if (box.children.length === 1 || (key !== 'k' && key !== 'l')) {
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
        else if (focusIndexer.get() === 1 || focusIndexer.get() === getHeight() - 1) {
            return scrollRememberer.startScroll(key === 'k' ? 'up' : 'down');
        }
        else {
            return scrollRememberer.stopScroll();
        }

        __.render();
    }

    return {
        navigator,
        action,
        preFocus,
        postFocus,
        ...(box.children[0].content === 'Queue' && { changeOrder }),
        ...(box.children[0].content === 'Playlist' && { circleList })
    };
}


module.exports = KeyListenerFactory;
