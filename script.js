const r = () => {
    // Grabbing variables from the Url object
    const url = new URL(window.location.href);
    const mp4 = url.searchParams.get("mp4");
    const json = url.searchParams.get("json");
    const timeMins = url.searchParams.get("mins");
    const timeSecs = url.searchParams.get("secs");
    const autoplay = url.searchParams.get("autoplay");

    if (!mp4) {
        return;
    }

    const hasJSON = (json !== null && json !== "");

    const vodElement = document.getElementById("vod");
    const chatElement = document.getElementById("chat");

    vodElement.currentTime = (Math.floor(timeMins * 60) + Math.floor(timeSecs));

    const createElement = (tag, properties) => {
        const element = document.createElement(tag);
        if(properties.classList){
            if(typeof properties.classList === "string"){
                for(const className of properties.classList.split(" "))
                    element.classList.add(className);
            }
            else if (Array.isArray(properties.classList)){ 
                for(const className of properties.classList)
                    element.classList.add(className);
            }
        }
        if(properties.style){
            for(const stylePropertyName in properties.style)
                element.style.setProperty(stylePropertyName, properties.style[stylePropertyName]);
        }
        if(properties.text){
            element.innerText = properties.text;
        }
        return element;
    };

    const changeUrlForTimeStamp = () => {
        //building the parameters for the timestamp
        //then setting state so you can send the url after seekedorupdated
        let params = url.searchParams;
        let currentMins = Math.floor(vodElement.currentTime / 60);
        let currentSecs = Math.round(vodElement.currentTime % 60);
        params.set('mins', currentMins);
        params.set('secs', currentSecs);

        history.replaceState(null, "", (url.origin + '?' + params.toString()));
    };


    const cap = 100; //The maximum comments

    let comments = [];

    const scroll = () => {
        chatElement.scrollTop = chatElement.scrollHeight;
    };
    
    const copyUrl = () => {
        const urlWithoutTime  = document.URL.slice(0 ,document.URL.indexOf('&min'));
        navigator.clipboard.writeText(urlWithoutTime);
        
    };
    const copyUrlWithTime = () => {
        navigator.clipboard.writeText(document.URL);
    };

    const shareButton = document.querySelector('.shareDropDown');
    const shareButtonNoTime = createElement('div', {text: 'No timestamp', classList: ["dropDownOptions"]});
    const shareButtonTime = createElement('div', {text: 'Current timestamp', classList: ["dropDownOptions"]});
        shareButtonNoTime.addEventListener('click', copyUrl);
        shareButtonTime.addEventListener('click', copyUrlWithTime);
        shareButton.appendChild(shareButtonNoTime);
        shareButton.appendChild(shareButtonTime);


    const getTimeString = (time) => {
        const hours = Math.floor(time / 60 / 60);
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time);
        return`${hours}:${`${(minutes - hours * 60)}`.padStart(2, 0)}:${`${(seconds - minutes * 60)}`.padStart(2, 0)}`;
    };

    const renderChat = () => {
        chatElement.innerHTML = "";
        const renderableComments = [];
        for (const comment of comments) {
            if (comment.content_offset_seconds > vodElement.currentTime) {
                break;
            }
            renderableComments.push(comment);
        }
        renderableComments.splice(0, renderableComments.length - cap);
        for (const comment of renderableComments) {
            const commentElement = document.createElement("p");

            const timeElement = createElement("span", {text: getTimeString(comment.content_offset_seconds), classList: ["time"]});

            const displayNameElement = createElement("span", {
                text: comment.commenter.display_name, 
                classList: ["display-name"], 
                style: {color: comment.message.user_color}
            });

            const dividerElement = createElement("span", {text: comment.message.is_action ? "" : ":", classList: ["divider"]});

            const fragmentsToAppend = [];

            for (fragment of comment.message.fragments) {
                const fragmentElement = createElement("span", {classList: ["fragment"]});
                if ("emoticon" in fragment) {
                    //build and append the Emotes
                    const emoteElement = document.createElement("img");
                    emoteElement.src = (`https://static-cdn.jtvnw.net/emoticons/v1/${fragment.emoticon.emoticon_id}/1.0`);
                    emoteElement.alt = fragment.text;
                    emoteElement.classList.add("emoticon");
                    fragmentElement.appendChild(emoteElement);
                }
                else {
                    fragmentElement.innerText = fragment.text;
                }

                fragmentsToAppend.push(fragmentElement);
            }; 

            commentElement.appendChild(timeElement);
            commentElement.appendChild(displayNameElement);
            commentElement.appendChild(dividerElement);
            fragmentsToAppend.forEach((fragmentToAppend) => {
                commentElement.appendChild(fragmentToAppend);
            });

            const commentMsgId = comment.message.user_notice_params;
            if(commentMsgId["msg-id"] != undefined){
                commentElement.classList.add("Highlighted");
            }

            if(comment.message.is_action){
                commentElement.classList.add("action");
            }

            chatElement.appendChild(commentElement);
        }
        scroll();
    };

    vodElement.ontimeupdate = () => {
        if (hasJSON) {
            renderChat();
        }
        changeUrlForTimeStamp(); // Update constantly
    };
    vodElement.onseeked = () => {
        changeUrlForTimeStamp();  // Update only when seeked, up to evan
    };

    vodElement.onloadeddata = () => {
        if (autoplay) {
            vodElement.play();
        }
    };

    vodElement.src = mp4;

    chat.addEventListener("scroll", () => {
        scroll();
    });

    addEventListener("resize", () => {
        scroll();
    });

    if (hasJSON) {
        fetch(json).then((res) => {
            res.json().then((data) => {
                comments = data.comments;
                renderChat();
            });
        });
    }

    const home = document.getElementById("home");
    home.style.setProperty("display", "none");
};

r();