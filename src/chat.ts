import { commentCap } from "./constants";
import { createElement } from "./elements";
import Badges from "./models/badges.model";
import Comment from "./models/comment.model";
import { getTimeString } from "./utilities";

class Chat {
    private _globalBadges: Badges = {};
    private _channelBadges: Badges = {};
    public constructor(public comments: Comment[], public chatElement: HTMLDivElement) {
        // fetching the badge data
        if (comments.length > 0) {
            fetch(`https://badges.twitch.tv/v1/badges/channels/${comments[0].channel_id}/display?language=en`).then((res) => {
                res.json().then((data) => {
                    this._channelBadges = data.badge_sets;
                });
            });
        }
        fetch("https://badges.twitch.tv/v1/badges/global/display?language=en").then((res) => {
            res.json().then((data) => {
                this._globalBadges = data.badge_sets;
            });
        });

        this.chatElement.addEventListener("scroll", () => {
            this.scroll();
        });
    }

    public render(currentTime: number){
        this.chatElement.innerHTML = "";
        const renderableComments = [];
        for (const comment of this.comments) {
            if (comment.content_offset_seconds > currentTime) {
                break;
            }
            renderableComments.push(comment);
        }
        renderableComments.splice(0, renderableComments.length - commentCap);
        for (const comment of renderableComments) {
            const commentElement = document.createElement("p");

            const timeElement = createElement("span", { text: getTimeString(comment.content_offset_seconds), classList: ["time"] });

            const badgesToAppend = [];
            if (comment.message.user_badges) {
                for (const badge of comment.message.user_badges) {
                    const badgeInfo = this.getBadgeInfo(badge._id, badge.version);
                    if (badgeInfo !== null) {
                        const badgeImageElement = document.createElement("img");
                        badgeImageElement.src = (badgeInfo.src);
                        badgeImageElement.alt = badgeInfo.description;

                        let badgeElement: HTMLElement = badgeImageElement;
                        if (badgeInfo.clickUrl.length > 0) {
                            const badgeAnchorElement = createElement("a", { classList: ["badge"] });
                            badgeAnchorElement.href = badgeInfo.clickUrl;
                            badgeAnchorElement.target = "_blank";
                            badgeAnchorElement.appendChild(badgeImageElement);
                            badgeElement = badgeAnchorElement;
                        }
                        badgeElement.classList.add("badge");
                        badgeElement.title = badgeInfo.description;
                        badgesToAppend.push(badgeElement);
                    }
                }
            }

            const displayNameElement = createElement("span", {
                text: comment.commenter.display_name,
                classList: ["display-name"],
                style: { color: comment.message.user_color }
            });

            const dividerElement = createElement("span", { text: comment.message.is_action ? " " : ": ", classList: ["divider"] });

            const fragmentsToAppend = [];

            for (const fragment of comment.message.fragments) {
                const fragmentElement = createElement("span", { classList: ["fragment"] });
                if (fragment.emoticon) {
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
            badgesToAppend.forEach((badgetoAppend) => {
                commentElement.appendChild(badgetoAppend);
            });
            commentElement.appendChild(displayNameElement);
            commentElement.appendChild(dividerElement);
            fragmentsToAppend.forEach((fragmentToAppend) => {
                commentElement.appendChild(fragmentToAppend);
            });

            const commentMsgId = comment.message.user_notice_params;
            if (commentMsgId["msg-id"] != undefined) {
                commentElement.classList.add("Highlighted");
            }

            if (comment.message.is_action) {
                commentElement.classList.add("action");
            }

            this.chatElement.appendChild(commentElement);
        }
        this.scroll();
    }

    public scroll(){
        this.chatElement.scrollTop = this.chatElement.scrollHeight;
    }

    private getBadgeInfo(badgeName: string, version: string){
        if (this._channelBadges[badgeName]) {
            const badgeInfo = this._channelBadges[badgeName].versions[version];
            if (badgeInfo) {
                return {
                    src: badgeInfo.image_url_1x,
                    description: badgeInfo.description,
                    clickUrl: badgeInfo.click_url
                };
            }
        }
        else if (this._globalBadges[badgeName]) {
            const badgeInfo = this._globalBadges[badgeName].versions[version];
            if (badgeInfo) {
                return {
                    src: badgeInfo.image_url_1x,
                    description: badgeInfo.description,
                    clickUrl: badgeInfo.click_url
                };
            }
        }
        return null;
    }
}

export default Chat;