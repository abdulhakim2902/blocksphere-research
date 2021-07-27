const axios = require('axios');
const express = require('express');

const app = express();
const PORT = 3000;

app.get('/scrape-facebook', async (req, res) => {
    const {fbURL} = req.query;

    let fbPost = null;

    try {
        const {data} = await axios({
            method: 'get',
            url: fbURL,
            headers: {
                "Accept-Language": "en-US,en:q=0.5",
                "Sec-Fetch-User": "?1",
                "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Mobile Safari/537.36"
            }
        });

        let platform_account_id = '';
        let profile_image_url = '';

        const findSocialMedialPostingIndex = data.search('"SocialMediaPosting"');
        const post = data.substring(findSocialMedialPostingIndex);

        // Get platform created at
        const findDateCreatedIndex = post.search('"dateCreated"');
        const findDateModifiedIndex = post.search('"dateModified"');
        const findIndetifierIndex = post.search('"identifier":"')
        const platformCreatedAt = post.substring(findDateCreatedIndex + '"dateCreated"'.length + 2, findDateModifiedIndex - 2)

        // Get platform account id
        const identifierIndex = post.substring(findIndetifierIndex + '"identifier":"'.length)

        for (let i = 0; i < identifierIndex.length; i++) {
        if (identifierIndex[i] == '"' || identifierIndex[i] == ';' || identifierIndex[i] == ':') break

        platform_account_id += identifierIndex[i]
        }

        // Get profile image url
        const findIndex = post.search(`"identifier":${platform_account_id}`);
        const getString = post.substring(findIndex);
        const findImageIndex = getString.search('"image"');
        const getImageString = getString.substring(findImageIndex + '"image"'.length + 2);

        for (let i = 0; i < getImageString.length; i++) {
        if (getImageString[i] == '"') break

        profile_image_url += getImageString[i];

        }

        // Get name
        let arrayName = [];

        for (let i = findIndex - 1; i > 0; i--) {
        if (post[i] === ":") break;
        if (post[i] == '"' || post[i] == ",") continue

        arrayName.unshift(post[i])
        }

        // Get username
        const getUrl = post.substring(findIndex + `"identifier":${platform_account_id},"url":"`.length);

        let url = '';

        for (let i = 0; getUrl.length; i++) {
        if (getUrl[i] === '"') break
        url += getUrl[i]
        }

        const userName = url.replace(/\\/g, '').split('/')[3]

        fbPost = {
            platformCreatedAt: platformCreatedAt,
            platformUser: {
                name: arrayName.join(''),
                username: userName,
                platform_account_id: platform_account_id,
                profile_image_url: profile_image_url.split('\\').join('')
            }
        }
    } catch(error) {
        console.log(error)
    }
    
    res.send(fbPost);
});
app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`)
})