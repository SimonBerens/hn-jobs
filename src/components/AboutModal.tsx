import {Fragment} from 'react'
import {Dialog, Transition} from '@headlessui/react'
import {HiInformationCircle, HiX} from 'react-icons/hi'

interface AboutModalProps {
    open: boolean
    setOpen: (open: boolean) => void
}

export function AboutModal({ open, setOpen }: AboutModalProps) {

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={setOpen}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                                <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                                    <button
                                        type="button"
                                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        onClick={() => setOpen(false)}
                                    >
                                        <span className="sr-only">Close</span>
                                        <HiX className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <HiInformationCircle className="h-6 w-6 text-gray-600" aria-hidden="true" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                                            About HN Hiring Trends
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Every month, the <a href="https://news.ycombinator.com/user?id=whoishiring" className="underline decoration-2">whoishiring</a> bot on HackerNews asks for people and companies to share if they&lsquo;re looking for jobs or hiring.
                                                This site scrapes the comments from those posts and displays the number of top level comments per post.
                                                <br/>
                                                <br/>
                                                You can hover over the data points to see the exact number of top level comments, or you can click on the datapoints to go to the original post.
                                                <br/>
                                                <br/>
                                                You can filter the comments by keywords such as &quot;remote&quot;, &quot;senior&quot;, or &quot;nyc&quot;.
                                                <br/>
                                                <br/>
                                                Adding multiple filters lets you compare trends between keywords. For example, you can compare the number of &quot;sf&quot; and &quot;nyc&quot; job postings.
                                                <br/>
                                                <br/>
                                                Your filters are synced with the url, so if you want to share a specific view, you can just copy the url!
                                                <br/>
                                                <br/>
                                                If you found this tool useful, you can follow me on
                                                {" "}<a href="https://twitter.com/sberens1" className="underline decoration-2">Twitter</a>{" "}
                                                or star it on
                                                {" "}<a href="https://www.github.com/simonberens/hn-jobs" className="underline decoration-2">GitHub</a>!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        className="inline-flex w-full justify-center rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 sm:ml-3 sm:w-auto"
                                        onClick={() => setOpen(false)}
                                    >
                                        Deactivate
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                        onClick={() => setOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}
