import { useEffect } from 'react';

export default function Toast({ msg, type, onHide }) {
  useEffect(() => {
    const t = setTimeout(onHide, 3400);
    return () => clearTimeout(t);
  }, [msg, onHide]);

  return (
    <div className={`toast toast-visible ${type || 'success'}`}>
      {msg}
    </div>
  );
}
