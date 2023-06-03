import {useState} from "react";

type AutoCompleteProps = {
    suggestions: string[];
    activeSelection: number;
    onSelectionClick?: (index: number) => void;
};

export default function AutoComplete(props: AutoCompleteProps) {
    const [hoverSelectingSuggestion, setHoverSelectingSuggestion] = useState<number | undefined>();

    return (<div className='suggestions absolute top-16 left-44 p-5 my-2 rounded-xl shadow-xl bg-white/30 backdrop-blur-md'>
        {props.suggestions.map((suggestion, index) => (
            <p key={`suggestion-${index}`}
               className={`suggestions ${(props.activeSelection == index && !hoverSelectingSuggestion) || hoverSelectingSuggestion == index ? 'font-bold' : ''} select-none`}
               onMouseEnter={() => setHoverSelectingSuggestion(index)}
               onMouseLeave={() => setHoverSelectingSuggestion(undefined)}
               onClick={() => props.onSelectionClick?.(index)}
            >{suggestion}</p>
        ))}
    </div>);
}
