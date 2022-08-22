interface Comment {
    _id: string;
    channel_id: string;
    commenter: {
        _id: string;
        bio: string;
        created_at: string;
        display_name: string;
        logo: string;
        name: string;
        type: string;
        updated_at: string;
    };
    content_id: string;
    content_offset_seconds: number;
    content_type: string;
    created_at: string;
    message: {
        body: string;
        emoticons?: {
            _id: string;
            begin: number;
            end: number;
        }[]
        fragments: {
            text: string;
            emoticon?: {
                emoticon_id: string;
                emoticon_set_id: string;
            }
        }[];
        is_action: boolean;
        user_badges?: {
            _id: string;
            version: string;
        }[];
        user_color: string;
        user_notice_params: { [name: string]: string | undefined };
    },
    source: string;
    state: string;
    updated_at: string;
}
export default Comment;