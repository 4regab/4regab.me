import React from 'react';
interface ParsedContent {
    type: 'text' | 'code' | 'image';
    content: string;
    language?: string;
    alt?: string;
}
export declare function parseMessageContent(content: string): ParsedContent[];
interface MessageContentProps {
    content: string;
    className?: string;
}
declare const MessageContent: React.FC<MessageContentProps>;
export default MessageContent;
