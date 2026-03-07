import { useEffect } from 'react';

export default function Toast({ msg, type, onHide }) {
  useEffect(() => {
    const t = setTimeout(onHide, 3400);
    return () => clearTimeout(t);
  }, [msg, onHide]);

  return (
    <div className={`toast toast-visible ${type || 'success'}`}>
      <span className="toast-text">{msg}</span>
      <button
        type="button"
        className="toast-close"
        onClick={onHide}
        aria-label="Close notification"
      >
        <i className="fa-solid fa-xmark" />
      </button>
    </div>
  );
}
