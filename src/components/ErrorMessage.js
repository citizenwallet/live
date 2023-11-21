const ErrorMessage = (error, options = {}) => {
  return (
    <div className="flex justify-center flex-col">
      <div className="mx-auto p-4">
        <div
          className="max-w-md p-4 mb-4 text-center text-sm text-red-700 bg-red-100 rounded-lg shadow-md dark:bg-red-200 dark:text-red-800"
          role="alert"
        >
          <font className="font-bold">{error}</font>
          <p>{options.message}</p>
        </div>
        <div className="text-center text-sm">
          Need some help? Join our{" "}
          <a href="https://discord.citizenwallet.xyz">Discord</a>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
