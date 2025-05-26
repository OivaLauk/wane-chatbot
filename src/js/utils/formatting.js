export function formatText(text) {
    if (!text) return '';
    
    // First extract code blocks to prevent internal formatting
    const codeBlocks = [];
    let processedText = text.replace(/```([\w]*)\n([\s\S]+?)\n```/g, (match, lang, code) => {
        const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
        codeBlocks.push({ lang: lang || '', code: code.trim() });
        return placeholder;
    });
    
    // Apply formatting to non-code content
    processedText = processedText
        .replace(/\*\*\*([^*]+?)\*\*\*/g, '<strong class="triple-asterisk">$1</strong>')
        .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+?)\*/g, '<span class="ai-thought">$1</span>')
        .replace(/\n/g, '<br>');

    // Restore code blocks with proper HTML structure
    processedText = processedText.replace(/__CODE_BLOCK_(\d+)__/g, (_, index) => {
        const { lang, code } = codeBlocks[parseInt(index)];
        return `<pre><code class="${lang}">${code}</code></pre>`;
    });
    
    return processedText;
}