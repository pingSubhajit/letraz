import {Circle, Path, Svg, SVGProps} from '@react-pdf/renderer'

const GlobePDF = (props: SVGProps) => {
	return (
		<Svg
			{...props} width="24" height="24" viewBox="0 0 24 24" fill="none"
			stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
		>
			<Circle cx="12" cy="12" r="10"/>
			<Path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
			<Path d="M2 12h20"/>
		</Svg>
	)
}

export default GlobePDF
