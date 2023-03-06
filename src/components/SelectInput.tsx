import {Fragment} from 'react'
import {Listbox, Transition} from '@headlessui/react'
import {HiCheck, HiChevronUpDown} from 'react-icons/hi2'
import {recordToEntries} from "@/util";


interface SelectInputProps<T extends string> {
    selected: T
    setSelected: (value: T) => void
    options: Record<T, string>
}

function classNames(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}

export function SelectInput<T extends string>({selected, setSelected, options}: SelectInputProps<T>) {

    return (
        <Listbox value={selected} onChange={setSelected}>
            {({open}) => (
                <>
                    <div className="relative mt-2">
                        <Listbox.Button
                            className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                            <span className="block truncate">{options[selected]}</span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <HiChevronUpDown className="h-5 w-5 text-gray-400" aria-hidden="true"/>
                        </span>
                        </Listbox.Button>

                        <Transition
                            show={open}
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <Listbox.Options
                                className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                {recordToEntries(options).map(([id, label]) => (
                                    <Listbox.Option
                                        key={id}
                                        className={({active}) =>
                                            classNames(
                                                active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                                                'relative cursor-default select-none py-2 pl-8 pr-4'
                                            )
                                        }
                                        value={id}
                                    >
                                        {({selected, active}) => (
                                            <>
                        <span className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}>
                          {label}
                        </span>

                                                {selected ? (
                                                    <span
                                                        className={classNames(
                                                            active ? 'text-white' : 'text-indigo-600',
                                                            'absolute inset-y-0 left-0 flex items-center pl-1.5'
                                                        )}
                                                    >
                            <HiCheck className="h-5 w-5" aria-hidden="true"/>
                          </span>
                                                ) : null}
                                            </>
                                        )}
                                    </Listbox.Option>
                                ))}
                            </Listbox.Options>
                        </Transition>
                    </div>
                </>
            )}
        </Listbox>
    )
}
