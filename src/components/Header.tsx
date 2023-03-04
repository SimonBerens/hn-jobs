import {BsTwitter, BsGithub} from "react-icons/bs"

export function Header() {
    return (
        <div className="h-12 w-full
                        flex flex-row justify-center">
            <div className="font-sans text-xl font-medium mt-2">
                HN Hiring Trends
            </div>
            <div className="flex flex-row items-center
                            absolute top-3 right-10">
                <a href={"https://www.twitter.com/sberens1"}>
                    <BsTwitter className="text-2xl mr-2"/>
                </a>
                <a href={"https://www.github.com/simonberens/hn-jobs"}>
                    <BsGithub className="text-2xl"/>
                </a>
            </div>
        </div>
    )
}