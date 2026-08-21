import { useEffect, useState } from "react";

export default function Preloader() {
    const [hide, setHide] = useState(false);

    useEffect(() => {
        document.body.classList.add("preloader-lock");

        function onLoad() {
            document.body.classList.remove("preloader-lock");
            setTimeout(() => setHide(true), 400);
        }

        if (document.readyState === "complete") {
            onLoad();
        } else {
            window.addEventListener("load", onLoad);
        }

        return () => window.removeEventListener("load", onLoad);
    }, []);

    return (
        <div id="preloader" className={hide ? "hide" : ""}>
            <div className="preloader-inner">
                <div className="preloader-orbit">
                    <div className="preloader-core">A</div>
                </div>
            </div>
        </div>
    );
}
