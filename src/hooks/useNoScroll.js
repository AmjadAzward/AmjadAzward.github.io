import { useEffect } from "react";

// Locks page scrolling for as long as the calling component is mounted,
// restoring it on unmount (route change).
export default function useNoScroll() {
    useEffect(() => {
        document.body.classList.add("no-scroll");
        return () => document.body.classList.remove("no-scroll");
    }, []);
}
