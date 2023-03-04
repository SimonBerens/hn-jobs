type RemoveFilterButtonProps = {
    onClick: () => void
}

export function RemoveFilterButton({ onClick }: RemoveFilterButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="rounded-md bg-white py-2 px-3.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50
            mb-1"
        >
            Remove Filter
        </button>
    );
}