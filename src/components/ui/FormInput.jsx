const FormInput = ({
  label,
  id,
  type = "text",
  placeholder,
  className = "",
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label
        htmlFor={id}
        className="text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className={`
          w-full rounded-md border border-gray-300
          px-3 py-2 text-sm
          focus:outline-none focus:ring-2
          focus:ring-blue-500 focus:border-blue-500
          ${className}
        `}
        {...props}
      />
    </div>
  );
};

export default FormInput;
