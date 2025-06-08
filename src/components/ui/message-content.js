import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import CodeBlock from '@/components/ui/code-block';
// Smart code detection function
function detectCodeBlocks(content, existingMatches) {
    const lines = content.split('\n');
    let potentialCodeBlocks = [];
    // More aggressive code detection patterns
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // C/C++ patterns - comprehensive detection
        if (line.match(/^#include\s*<.*?>/) ||
            line.match(/^#include\s*".*?"/) ||
            line.match(/^int\s+main\s*\(/) ||
            line.match(/^\s*(printf|scanf|switch|case|if|for|while|return|void|char|double|float)\s*[\(\{]/) ||
            line.match(/^\s*\{/) ||
            line.match(/^\s*\}/) ||
            line.match(/^\s*\/\/.*/) ||
            line.match(/^\s*\/\*.*\*\//) ||
            line.match(/^\s*\w+\s+\w+\s*[;=]/) ||
            line.match(/^\s*case\s+['"][^'"]*['"]:\s*$/) ||
            line.match(/^\s*case\s+\w+:\s*$/) ||
            line.match(/^\s*break;\s*$/) ||
            line.match(/^\s*default:\s*$/) ||
            line.match(/^\s*else\s*\{?\s*$/)) {
            // Find the start of this code block
            let blockStart = i;
            // Look backwards for the start of the code block
            while (blockStart > 0) {
                const checkLine = lines[blockStart - 1].trim();
                // Stop if we hit explanatory text patterns
                if (checkLine.match(/^Here|^To|^Save|^Compile|^Run|^Example|^Explanation|^How to|^\d+\./i) ||
                    checkLine.match(/^[A-Z][^:]*:$/) ||
                    checkLine === '') {
                    break;
                }
                // Continue if it looks like code
                if (checkLine.match(/^(#include|int|printf|scanf|switch|case|if|for|while|return|void|char|double|float|\{|\}|\/\/|\/\*|\w+\s+\w+|break;|default:|else)/)) {
                    blockStart--;
                }
                else {
                    break;
                }
            }
            // Find the end of this code block
            let blockEnd = i;
            while (blockEnd < lines.length - 1) {
                const checkLine = lines[blockEnd + 1].trim();
                // Stop if we hit explanatory text
                if (checkLine.match(/^Here|^To|^Save|^Compile|^Run|^Example|^Explanation|^How to|^\d+\./i) ||
                    checkLine.match(/^[A-Z][^:]*:$/) ||
                    (checkLine !== '' && !checkLine.match(/^(#include|int|printf|scanf|switch|case|if|for|while|return|void|char|double|float|\{|\}|\/\/|\/\*|\w+\s+\w+|break;|default:|else)/))) {
                    break;
                }
                blockEnd++;
            }
            if (blockEnd > blockStart) {
                potentialCodeBlocks.push({
                    start: blockStart,
                    end: blockEnd,
                    language: 'c'
                });
                i = blockEnd; // Skip ahead
            }
        }
        // Bash/Shell patterns
        else if (line.match(/^\s*(gcc|g\+\+|clang|make|bash|sh|\.\/|\$\s|\w+\$|.*\.exe|.*\.out)/)) {
            let blockStart = i;
            let blockEnd = i;
            // Look for additional shell commands
            while (blockEnd < lines.length - 1) {
                const nextShellLine = lines[blockEnd + 1].trim();
                if (nextShellLine.match(/^\s*(gcc|g\+\+|clang|make|bash|sh|\.\/|\$\s|\w+\$|.*\.exe|.*\.out)/)) {
                    blockEnd++;
                }
                else {
                    break;
                }
            }
            potentialCodeBlocks.push({
                start: blockStart,
                end: blockEnd,
                language: 'bash'
            });
            i = blockEnd;
        }
    }
    // Convert line-based code blocks to character-based matches
    const codeMatches = [];
    potentialCodeBlocks.forEach(block => {
        const startChar = lines.slice(0, block.start).join('\n').length + (block.start > 0 ? 1 : 0);
        const endChar = lines.slice(0, block.end + 1).join('\n').length;
        const codeContent = lines.slice(block.start, block.end + 1).join('\n').trim();
        // Check if this code block doesn't overlap with existing matches
        const overlaps = existingMatches.some(match => (startChar >= match.index && startChar < match.index + match.length) ||
            (endChar > match.index && endChar <= match.index + match.length) ||
            (startChar <= match.index && endChar >= match.index + match.length));
        if (!overlaps && codeContent.length > 30) { // Only add substantial code blocks
            codeMatches.push({
                index: startChar,
                length: endChar - startChar,
                type: 'code',
                content: codeContent,
                language: block.language
            });
        }
    });
    return codeMatches;
}
// Enhanced function to parse message content with better code detection
export function parseMessageContent(content) {
    const parts = [];
    let currentIndex = 0;
    // Single comprehensive regex pattern to avoid overlaps
    const patterns = [
        // Comprehensive markdown code blocks (handles all variations)
        {
            regex: /```(\w+)?\s*\n?([\s\S]*?)```/g,
            type: 'code',
            languageIndex: 1,
            contentIndex: 2
        },
        // Malformed code blocks: ``language\ncode` or ```language\ncode`
        {
            regex: /``(\w+)?\s*\n?([\s\S]*?)`(?!`)/g,
            type: 'code',
            languageIndex: 1,
            contentIndex: 2
        },
        // Markdown images
        {
            regex: /!\[([^\]]*)\]\((data:image\/[^;]+;base64,[^)]+)\)/g,
            type: 'image',
            altIndex: 1,
            contentIndex: 2
        },
        // HTML images
        {
            regex: /<img[^>]+src="(data:image\/[^;]+;base64,[^"]+)"[^>]*alt="([^"]*)"[^>]*\/?>/g,
            type: 'image',
            contentIndex: 1,
            altIndex: 2
        }
    ];
    // Find all matches and their positions
    const matches = [];
    // Process each pattern
    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.regex.exec(content)) !== null) {
            if (pattern.type === 'code') {
                let codeContent = '';
                let language = '';
                // Handle regular code blocks
                codeContent = match[pattern.contentIndex]?.trim() || '';
                language = (pattern.languageIndex !== null ? match[pattern.languageIndex] : '') || 'text';
                if (codeContent) {
                    matches.push({
                        index: match.index,
                        length: match[0].length,
                        type: 'code',
                        content: codeContent,
                        language: language,
                        source: 'markdown'
                    });
                }
            }
            else if (pattern.type === 'image') {
                matches.push({
                    index: match.index,
                    length: match[0].length,
                    type: 'image',
                    content: match[pattern.contentIndex],
                    alt: pattern.altIndex ? match[pattern.altIndex] : undefined,
                    source: 'markdown'
                });
            }
        }
    });
    // Only use smart code detection if NO markdown code blocks were found
    if (!matches.some(match => match.type === 'code' && match.source === 'markdown')) {
        // Using smart detection for code blocks
        const codeBlocks = detectCodeBlocks(content, matches);
        const smartMatches = codeBlocks.map(block => ({
            ...block,
            source: 'smart'
        }));
        matches.push(...smartMatches);
    }
    // Remove overlapping matches (prioritize markdown over smart detection)
    const deduplicatedMatches = [];
    const sortedMatches = matches.sort((a, b) => a.index - b.index);
    for (const match of sortedMatches) {
        // Check if this match overlaps with any existing match
        const overlaps = deduplicatedMatches.some(existing => (match.index >= existing.index && match.index < existing.index + existing.length) ||
            (match.index + match.length > existing.index && match.index + match.length <= existing.index + existing.length) ||
            (match.index <= existing.index && match.index + match.length >= existing.index + existing.length));
        if (!overlaps) {
            deduplicatedMatches.push(match);
        }
    }
    // Extract text and special content using deduplicated matches
    for (const match of deduplicatedMatches) {
        // Add text before this match
        if (currentIndex < match.index) {
            const textContent = content.slice(currentIndex, match.index).trim();
            if (textContent) {
                parts.push({
                    type: 'text',
                    content: textContent
                });
            }
        }
        // Add the special content (code or image)
        parts.push({
            type: match.type,
            content: match.content,
            language: match.language,
            alt: match.alt
        });
        currentIndex = match.index + match.length;
    }
    // Add remaining text
    if (currentIndex < content.length) {
        const remainingText = content.slice(currentIndex).trim();
        if (remainingText) {
            parts.push({
                type: 'text',
                content: remainingText
            });
        }
    }
    // If no special content found, return the entire content as text
    if (parts.length === 0) {
        parts.push({
            type: 'text',
            content: content
        });
    }
    return parts;
}
// Function to render inline code within text
function renderTextWithInlineCode(text) {
    const inlineCodeRegex = /`([^`]+)`/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = inlineCodeRegex.exec(text)) !== null) {
        // Add text before the inline code
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }
        // Add the inline code
        parts.push(_jsx("code", { className: "bg-muted/70 px-1.5 py-0.5 rounded text-sm font-mono text-foreground/90 border", children: match[1] }, match.index));
        lastIndex = match.index + match[0].length;
    }
    // Add remaining text
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }
    return parts.length > 1 ? parts : text;
}
const MessageContent = ({ content, className }) => {
    const parsedContent = parseMessageContent(content);
    return (_jsx("div", { className: className, children: parsedContent.map((part, index) => {
            switch (part.type) {
                case 'code':
                    return (_jsx(CodeBlock, { code: part.content, language: part.language, className: "my-3" }, index));
                case 'image':
                    return (_jsx("div", { className: "my-3", children: _jsxs("div", { className: "border rounded-lg overflow-hidden bg-muted/50", children: [_jsx("img", { src: part.content, alt: part.alt || `Generated Image ${index + 1}`, className: "w-full max-w-md rounded-lg shadow-sm", style: { maxHeight: '400px', objectFit: 'contain' }, onError: (e) => {
                                        console.error('Failed to load image:', e);
                                        const target = e.target;
                                        target.style.display = 'none';
                                    } }), _jsx("div", { className: "p-2 text-xs text-muted-foreground bg-muted/30", children: part.alt || `Generated Image ${index + 1}` })] }) }, index));
                case 'text':
                default:
                    return (_jsx("div", { className: "text-sm leading-relaxed break-words my-1", style: {
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            overflowWrap: 'anywhere'
                        }, children: renderTextWithInlineCode(part.content) }, index));
            }
        }) }));
};
export default MessageContent;
