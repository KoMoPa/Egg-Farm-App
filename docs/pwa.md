 A progressive Web App is a website first and foremost. It is not an app, it does not get compiled into other languages so that it can be run as an app, it is simply a website.

But it is a website that pretends to be an app in many cases. A "true" PWA will allow users to add the app to their device homepage like an app, but it's actually just a link to the website. But a PWA must also work offline, so that when users tap on the "app" icon for the site in a tunnel or on the subway, it still comes up.

    An offline website!?

Yes, an offline website. A PWA should make extensive use of caching and a new browser technology called Service Workers. Service Workers are "installed" by the browser to do any number of tasks. In the case of a PWA, Service Workers are used to intercept requests to the server and cache as much data as possible. So here is a how an offline website might work with Service Workers:

1: The user visits the website. This of course requires an internet connection, so all PWAs do have to be visited one time like normal in order to start working.

2: There is JavaScript code that tells the browser to install a Service Worker.

3: Now assuming these Service Workers were programmed properly, they will intercept requests to the server and respond appropriately. If the request is for something static (like a stylesheet) the service worker will look in the cache and if it finds the resource it will just use the cache version. If it can't find the cache version then it will make a request to the server, cache the response, and then use that cached version in the future.

4: If the request is for something that can't be cached (like data) then the Service Worker simply forwards the request (and maybe caches the newest data for reasons we'll see later).

5: If there is no Internet Connection, then the service worker can do stuff like serve up a cached "No Internet" page to display to the user, or if the Service Worker cached some data it could display the newest data and make it clear to the user that the website is just serving cached data.

That is how a website can be "offline" and still work. It is basically a lot of very advanced caching methods.

Service Workers can also store requests in order to deliver later once an internet connection is established again. Such as somebody posting a comment on Reddit. If Reddit used service workers, the service worker could detect that there is no Internet, store the comment and then upload the comment later in the background without bothering the user.

PWAs often make use of things like Web Push Notifications as well to make the website feel more like an app, but this is not necessary of course. 