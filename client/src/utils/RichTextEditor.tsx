import { Editor } from '@tinymce/tinymce-react';

interface RichTextEditorProps {
  value: string | undefined;
  onChange: (content: string) => void;
}

export default function RichTextEditor({
  value,
  onChange,
}: RichTextEditorProps) {
  const apiKey = import.meta.env.VITE_RICH_EDITOR_API_KEY;

  return (
    <Editor
      apiKey={apiKey}
      value={value}
      init={{
        height: 300,
        menubar: false,
        plugins: [
          'advlist',
          'autolink',
          'lists',
          'link',
          'image',
          'charmap',
          'anchor',
          'searchreplace',
          'visualblocks',
          'code',
          'fullscreen',
          'insertdatetime',
          'media',
          'table',
          'preview',
          'help',
          'wordcount',
        ],
        toolbar:
          'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
      }}
      onEditorChange={(content: string) => onChange(content)}
    />
  );
}
