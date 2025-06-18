import { Editor } from '@tinymce/tinymce-react';

export default function RichTextEditor() {
  const apiKey = import.meta.env.VITE_RICH_EDITOR_API_KEY;
  return (
    <Editor
      apiKey={apiKey}
      init={{
        height: 400,
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
      // onEditorChange={(content) => console.log(content)}
    />
  );
}
