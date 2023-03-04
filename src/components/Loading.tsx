import {LoadingState} from "@/hooks/useHnData";
import {ClipLoader} from "react-spinners";

type LoadingProps = {
    loading: LoadingState
}

export function Loading({loading}: LoadingProps) {
    if (loading === 'done') {
        return <></>
    }
    return (
        <div className="fixed top-1/4 w-full flex flex-col items-center font-medium">
            Loading comments...
            <ClipLoader />
        </div>
    )
}