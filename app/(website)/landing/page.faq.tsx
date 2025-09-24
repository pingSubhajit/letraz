'use client'

import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@/components/ui/accordion'

const LandingPageFaq = () => {
	return (
		<section className="max-w-3xl mx-auto w-min">
			<Accordion type="single" collapsible className="space-y-8 w-[600px]">
				<AccordionItem value="item-1" className="">
					<AccordionTrigger className="py-0 [&[data-state=closed]>p]:rounded-2xl">
						<p className="bg-neutral-200 h-full py-4 px-8 rounded-t-2xl text-lg transition-[border-radius] duration-300 ease-in-out">Is it accessible?</p>
					</AccordionTrigger>
					<AccordionContent className="bg-flame-100 pt-4 px-8 rounded-tl-2xl w-[600px] text-lg">
						Yes. It adheres to the WAI-ARIA design pattern.
					</AccordionContent>
				</AccordionItem>

				<AccordionItem value="item-2" className="">
					<AccordionTrigger className="py-0 [&[data-state=closed]>p]:rounded-2xl">
						<p className="bg-neutral-200 h-full py-4 px-8 rounded-t-2xl text-lg transition-[border-radius] duration-300 ease-in-out">Is it accessible?</p>
					</AccordionTrigger>
					<AccordionContent className="bg-flame-100 pt-4 px-8 rounded-tl-2xl w-[600px] text-lg">
						Yes. It adheres to the WAI-ARIA design pattern.
					</AccordionContent>
				</AccordionItem>

				<AccordionItem value="item-3" className="">
					<AccordionTrigger className="py-0 [&[data-state=closed]>p]:rounded-2xl">
						<p className="bg-neutral-200 h-full py-4 px-8 rounded-t-2xl text-lg transition-[border-radius] duration-300 ease-in-out">Is it accessible?</p>
					</AccordionTrigger>
					<AccordionContent className="bg-flame-100 pt-4 px-8 rounded-tl-2xl w-[600px] text-lg">
						Yes. It adheres to the WAI-ARIA design pattern.
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</section>
	)
}

export default LandingPageFaq
