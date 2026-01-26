'use client';

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="w-full h-[300px] bg-gray-50 border border-gray-200 rounded-lg animate-pulse" />,
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = '내용을 입력하세요...',
  minHeight = '300px',
}: RichTextEditorProps) {
  const quillRef = useRef<any>(null);

  // 이미지 핸들러 - base64 업로드 방지
  const imageHandler = () => {
    toast.error(
      '이미지는 직접 붙여넣기가 불가능합니다.\n하단의 "관련 이미지" 섹션을 이용해주세요.',
      { duration: 4000 }
    );
    
    // 이미지 삽입 차단
    return false;
  };

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        ['link'],
        [{ align: [] }],
        ['clean'],
      ],
      handlers: {
        image: imageHandler, // 커스텀 이미지 핸들러
      },
    },
  };

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'indent',
    'link',
    'align',
  ];

  return (
    <div className="rich-text-editor">
      {/* @ts-ignore - ReactQuill ref type issue */}
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        style={{ minHeight }}
      />
      <style jsx global>{`
        .rich-text-editor .ql-container {
          min-height: ${minHeight};
          font-size: 14px;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
        }
        .rich-text-editor .ql-editor {
          min-height: ${minHeight};
          padding: 1rem;
        }
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          background: #f9fafb;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
        /* 이미지 버튼 숨김 */
        .rich-text-editor .ql-toolbar .ql-image {
          display: none;
        }
      `}</style>
    </div>
  );
}
