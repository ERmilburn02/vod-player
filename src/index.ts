import Chat from "./chat";
import { createElement } from "./elements";

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

    const vodElement = <HTMLVideoElement>document.getElementById("vod");
    const chatElement = <HTMLDivElement>document.getElementById("chat");

    vodElement.currentTime = (Math.floor(parseFloat(timeMins ?? "0") * 60) + Math.floor(parseFloat(timeSecs ?? "0")));

    const changeUrlForTimeStamp = () => {
        //building the parameters for the timestamp
        //then setting state so you can send the url after seekedorupdated
        let params = url.searchParams;
        let currentMins = Math.floor(vodElement.currentTime / 60);
        let currentSecs = Math.round(vodElement.currentTime % 60);
        params.set("mins", currentMins.toString());
        params.set("secs", currentSecs.toString());

        history.replaceState(null, "", (url.origin + "?" + params.toString()));
    };

    let chat: Chat | null = null;

    const copyUrl = () => {
        const urlWithoutTime = document.URL.slice(0, document.URL.indexOf("&min"));
        navigator.clipboard.writeText(urlWithoutTime);
    };
    const copyUrlWithTime = () => {
        navigator.clipboard.writeText(document.URL);
    };

    const shareButton = document.querySelector<HTMLButtonElement>(".shareDropDown")!;
    const shareButtonNoTime = createElement("div", { text: "No timestamp", classList: ["dropDownOptions"] });
    const shareButtonTime = createElement("div", { text: "Current timestamp", classList: ["dropDownOptions"] });
    shareButtonNoTime.addEventListener("click", copyUrl);
    shareButtonTime.addEventListener("click", copyUrlWithTime);
    shareButton.appendChild(shareButtonNoTime);
    shareButton.appendChild(shareButtonTime);

    vodElement.ontimeupdate = () => {
        if (hasJSON) {
            chat?.render(vodElement.currentTime);
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

    

    addEventListener("resize", () => {
        chat?.scroll();
    });

    if (hasJSON) {
        fetch(json).then((res) => {
            res.json().then((data) => {
                chat = new Chat(data.comments, chatElement);
                chat?.render(vodElement.currentTime);
            });
        });
    }

    const home = document.getElementById("home")!;
    home.style.setProperty("display", "none");
};

r();