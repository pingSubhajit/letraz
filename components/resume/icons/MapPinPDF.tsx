import {Circle, Path, Svg, SVGProps} from '@react-pdf/renderer'

const MapPinPDF = (props: SVGProps) => {
	return (
		<Svg
			{...props} width="24" height="24" viewBox="0 0 24 24" fill="none"
	        stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
		>
			<Path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
			<Circle cx="12" cy="10" r="3"/>
		</Svg>
	)
}

export default MapPinPDF
