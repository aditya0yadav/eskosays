import { useEffect, useRef, useCallback } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean']
];

/**
 * React 19-compatible Quill editor.
 * Uses useRef + native Quill instantiation — no ReactDOM.findDOMNode.
 */
export default function QuillEditor({ value, onChange, minHeight = 400 }) {
    const containerRef = useRef(null);
    const quillRef = useRef(null);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    useEffect(() => {
        if (quillRef.current) return; // already mounted

        const quill = new Quill(containerRef.current, {
            theme: 'snow',
            modules: { toolbar: TOOLBAR_OPTIONS },
            placeholder: 'Write your blog post here…'
        });

        quill.on('text-change', () => {
            onChangeRef.current?.(quill.root.innerHTML);
        });

        quillRef.current = quill;
    }, []);

    // Sync incoming value without resetting cursor
    useEffect(() => {
        const quill = quillRef.current;
        if (!quill) return;
        const current = quill.root.innerHTML;
        // Only update if content genuinely differs (avoids cursor jump on every keystroke)
        if (value !== undefined && value !== current) {
            const sel = quill.getSelection();
            quill.root.innerHTML = value;
            if (sel) quill.setSelection(sel);
        }
    }, [value]);

    return (
        <div className="rounded-xl overflow-hidden border border-slate-200">
            <div ref={containerRef} style={{ minHeight }} />
        </div>
    );
}
