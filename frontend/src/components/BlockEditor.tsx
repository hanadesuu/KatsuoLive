'use client';

import { useEffect, useRef } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';
// @ts-ignore
import Header from '@editorjs/header';
// @ts-ignore
import List from '@editorjs/list';
// @ts-ignore
import Paragraph from '@editorjs/paragraph';
// @ts-ignore
import Quote from '@editorjs/quote';
// @ts-ignore
import Warning from '@editorjs/warning';
// @ts-ignore
import LinkTool from '@editorjs/link';
// @ts-ignore
import ImageTool from '@editorjs/image';

interface BlockEditorProps {
  data?: OutputData;
  onChange?: (data: OutputData) => void;
  readOnly?: boolean;
}

export default function BlockEditor({
  data,
  onChange,
  readOnly = false,
}: BlockEditorProps) {
  const editorRef = useRef<EditorJS | null>(null);
  const holderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!holderRef.current) return;

    const editor = new EditorJS({
      holder: holderRef.current,
      readOnly,
      data: data || {
        time: Date.now(),
        blocks: [],
      },
      tools: {
        header: {
          class: Header as any,
          config: {
            levels: [1, 2, 3, 4],
            defaultLevel: 2,
          },
        },
        list: {
          class: List as any,
          inlineToolbar: true,
        },
        paragraph: {
          class: Paragraph as any,
          inlineToolbar: true,
        },
        quote: {
          class: Quote as any,
          inlineToolbar: true,
        },
        warning: {
          class: Warning as any,
          inlineToolbar: true,
        },
        linkTool: {
          class: LinkTool as any,
          config: {
            endpoint: '/api/fetch-url',
          },
        },
        image: {
          class: ImageTool as any,
          config: {
            endpoints: {
              byFile: '/api/upload-image',
              byUrl: '/api/fetch-image',
            },
          },
        },
      },
      onChange: async () => {
        if (onChange && editorRef.current) {
          const outputData = await editorRef.current.save();
          onChange(outputData);
        }
      },
    });

    editorRef.current = editor;

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
      }
    };
  }, []);

  return (
    <div
      ref={holderRef}
      className="prose max-w-none border rounded-lg p-4 min-h-[400px]"
    />
  );
}
