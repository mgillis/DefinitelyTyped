import GhostAdminAPI from "@tryghost/admin-api";

// ExpectType GhostAdminAPI
const api = new GhostAdminAPI({
    url: "http://localhost:2368",
    key: "YOUR_ADMIN_API_KEY",
    version: "v5.0",
});

api.posts.add({
    title: "My first draft API post",
    lexical:
        '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Hello, beautiful world! 👋","type":"extended-text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
});

// Browsing posts returns Promise([Post...]);
// The resolved array will have a meta property
// ExpectType Promise<Post[]>
api.posts.browse();
// ExpectType Promise<Post>
api.posts.read({ id: "abcd1234" });
async function postTest() {
    // ExpectType Post
    const post = await api.posts.add({ title: "My first API post" });
    // ExpectType Promise<Post>
    api.posts.edit({ id: "abcd1234", title: "Renamed my post", updated_at: post.updated_at });
}
postTest();
// ExpectType Promise<void>
api.posts.delete({ id: "abcd1234" });

// Browsing pages returns Promise([Page...])
// The resolved array will have a meta property
// ExpectType Promise<Page[]>
api.pages.browse({ limit: 2 });
// ExpectType Promise<Page>
api.pages.read({ id: "abcd1234" });
async function pageTest() {
    // ExpectType Page
    const page = await api.pages.add({ title: "My first API page" });
    // ExpectType Promise<Page>
    api.pages.edit({ id: "abcd1234", title: "Renamed my page", updated_at: page.updated_at });
}
// ExpectType Promise<void>
api.pages.delete({ id: "abcd1234" });

// Uploading images returns Promise([Image...])
// ExpectType Promise<Image>
api.images.upload({ file: "/path/to/local/file" });

// "Publishing example"
// ---------------------

const path = require("path");

// Utility function to find and upload any images in an HTML string
function processImagesInHTML(html: string) {
    // Find images that Ghost Upload supports
    let imageRegex = /="([^"]*?(?:\.jpg|\.jpeg|\.gif|\.png|\.svg|\.sgvz))"/gim;
    let imagePromises = [];

    let result;
    while ((result = imageRegex.exec(html)) !== null) {
        let file = result[1];
        // Upload the image, using the original matched filename as a reference
        imagePromises.push(
            api.images.upload({
                ref: file,
                file: path.resolve(file),
            })
        );
    }

    return Promise.all(imagePromises).then((images) => {
        images.forEach((image) => (html = html.replace(image.ref!, image.url)));
        return html;
    });
}

// Your content
let html =
    '<p>My test post content.</p><figure><img src="/path/to/my/image.jpg" /><figcaption>My awesome photo</figcaption></figure>';

processImagesInHTML(html)
    .then((html) => {
        return api.posts
            .add(
                { title: "My Test Post", html },
                { source: "html" } // Tell the API to use HTML as the content source, instead of Lexical
            )
            .then((res) => console.log(JSON.stringify(res)))
            .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
