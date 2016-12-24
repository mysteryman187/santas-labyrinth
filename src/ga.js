(function (i, s, o, g, r, a, m) {
i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
    (i[r].q = i[r].q || []).push(arguments)
}, i[r].l = 1 * new Date(); a = s.createElement(o),
    m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

ga('create', 'UA-89384275-1', 'auto');
ga('send', 'pageview');


// ga('send', 'event', [eventCategory], [eventAction], [eventLabel], [eventValue], [fieldsObject]);
// Event fields

// The following table summarizes the event fields:

// Field Name	Value Type	Required	Description
// eventCategory	text	yes	Typically the object that was interacted with (e.g. 'Video')
// eventAction	text	yes	The type of interaction (e.g. 'play')
// eventLabel	text	no	Useful for categorizing events (e.g. 'Fall Campaign')
// eventValue	integer	no	A numeric value associated with the event (e.g. 42)

export const send = (metric) => {
    ga('send', {
        hitType: 'event',
        eventCategory: 'Game',
        eventAction: metric,
        eventLabel: 'Game'
    });
};

// export const startLevel = level => {
//     ga('send', {
//         hitType: 'event',
//         eventCategory: 'Game',
//         eventAction: 'StartLevel',
//         eventLabel: 'Game',
//         eventValue: level
//     });
// }

export const finishLevel = level => {
    ga('send', {
        hitType: 'event',
        eventCategory: 'Game',
        eventAction: 'FinishLevel',
        eventLabel: 'FinishLevel-' + level,
        eventValue: level
    });
}

export const startStory = () => {
    ga('send', {
        hitType: 'event',
        eventCategory: 'Game',
        eventAction: 'StartStory',
        eventLabel: 'StartStory'
    });
}


