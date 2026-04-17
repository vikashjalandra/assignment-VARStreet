const FieldError = ({ message }) => {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-xs font-medium text-slate-700">{message}</p>;
};

export default FieldError;
