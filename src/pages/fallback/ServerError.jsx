import { Link, useNavigate } from "react-router-dom";

const ServerError = () => {
    const navigate = useNavigate();
  return (
     <>
      <section className="font-tech">
        <div className="h-screen mx-auto flex px-5 py-24 items-center justify-center flex-col">
          <img
            className="lg:w-1/3 md:w-2/6 w-4/6 mb-4 object-cover object-center rounded"
            alt="hero"
            src="/images/401.png"
          ></img>
          <div className="text-center lg:w-2/3 w-full">
            <h1 className="title-font sm:text-3xl text-3xl mb-2 font-medium text-pumpkin">
              Server Error
            </h1>
            <p className="mb-8 leading-relaxed text-charcoal-100">
              Sorry, there was an error processing your request.
            </p>
            <div className="flex justify-center">
              <Link
                to="/"
                className="inline-flex text-creame bg-charcoal border-0 py-2 px-6 focus:outline-none hover:bg-charcoal-100 rounded text-lg shadow-md shadow-[#000a4ea0]"
              >
                Back to Home
              </Link>
              <button
                onClick={() => {
                  if (window.history.length > 1) {
                    navigate(-1);
                  } else {
                    navigate("/");
                  }
                }}
                className="ml-4 inline-flex text-charcoal  bg-[#f1f1f1] border-0 py-2 px-6 focus:outline-none hover:bg-[#f9f9f9] rounded text-lg shadow-md shadow-[#000a4ea0]"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default ServerError
