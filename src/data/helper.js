// Helper bot (the squirrel): the tips it gives to first-time visitors.
// Shown by components/HelperBot.jsx, picked by hooks/useHelper.js.
//
// Each tip is shown once per browser. The squirrel appears in the bottom-right
// corner, a pointer travels from it to the thing it is talking about, and the
// tip leaves by itself after `duration`, or as soon as the visitor clicks,
// types or scrolls.
//
// HOW TO ADD A TIP
// ----------------
// 1. Mark the element the squirrel should point at with a data-helper
//    attribute, e.g. <button data-helper="sound-toggle">. (Skip this for a tip
//    that points at nothing.)
// 2. Add one object to HELPER_STEPS below. Tips are tried from top to bottom;
//    the first one that has not been seen and whose trigger matches is shown.
//
//   {
//     id: 'sound-toggle',          // required. Unique. This is what is remembered as "seen".
//     view: 'hub',                 // trigger: the page the visitor is on. One of
//                                  //   'hub' | 'proxmox' | 'dev' | 'vulns' | 'writeups',
//                                  //   or a list: ['hub', 'dev']. Leave out for "any page".
//     when: (state) => state.theme === 'cyberpunk',
//                                  // optional extra trigger. Receives the app state
//                                  //   (state/AppContext.jsx): theme, view, zoom,
//                                  //   activeReportId, activeWriteupId, ...
//     target: '[data-helper="sound-toggle"]',
//                                  // optional. CSS selector of the element to point at.
//     title: 'Sound effects',      // required. Bold first line of the speech bubble.
//     text: 'Turn the terminal sounds on here.',
//                                  // required. One or two short sentences.
//     callout: 'theme-modes',      // optional. A close-up panel shown next to the target.
//                                  //   Must be a key of CALLOUTS in components/HelperBot.jsx.
//     delay: 1200,                 // optional. ms to wait after the trigger (default 1200).
//     duration: 12000,             // optional. ms before the tip leaves by itself (default 12000).
//   },
//
// 3. For a close-up panel of your own, write a small component and add it to
//    CALLOUTS in components/HelperBot.jsx, then name it in `callout`.
//
// TO SEE A TIP AGAIN while testing, run this in the browser console and reload:
//   localStorage.removeItem('mainframe.helper')
//
// Keep `when` cheap and free of side effects: it runs on every state change.
// The lab (Sector 01) has its own older guide cursor, components/TourGuide.jsx;
// avoid tips with view: 'proxmox' and a target while that guide is on.

export const HELPER_STORAGE_KEY = 'mainframe.helper';
export const HELPER_DEFAULTS = { delay: 1200, duration: 12000 };

export const HELPER_STEPS = [
  {
    id: 'theme-modes',
    view: 'hub',
    target: '[data-helper="theme-toggle"]',
    title: 'Pick how the site looks',
    text: 'This switch changes the whole site between Night, Dim and Day. Try Dim or Day if the dark look is hard to read.',
    callout: 'theme-modes',
    duration: 14000,
  },
];
