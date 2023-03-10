type AddFilterButtonProps = {
    onClick: () => void
}

export function AddSearchButton({ onClick }: AddFilterButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="rounded-md bg-indigo-50 py-2 px-3 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100
            max-sm:w-full self-start mb-10 sm:mb-0"        >
            Add Search
        </button>
    );
}