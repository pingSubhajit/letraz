'use client'

import {cn} from '@/lib/utils'
import {motion} from 'motion/react'

const LetrazStoryPageContent = ({className}: {className?: string}) => {
	return (
		<motion.div
			className={cn('w-full prose-sm lg:prose xl:prose-lg prose-orange prose-a:text-flame-500 max-w-none tracking-tight opacity-80', className)}
			initial={{opacity: 0}}
			whileInView={{opacity: 1}}
			exit={{opacity: 0}}
			transition={{duration: 0.5}}
		>
			<h3>Bridging Potential and Opportunity</h3>

			<p>The job application process often feels like a maze. Candidates meticulously pour their energy into
				creating resumes, only to face uncertainty—will their hard work resonate with recruiters or pass the
				filters of Applicant Tracking Systems (ATS)? Many times, rejections aren’t about skills or talent but
				about presentation: how well a resume aligns with the nuances of a job description.</p>
			<p>At Letraz, we saw the gap between effort and outcome. We understood the frustration of talented
				individuals who simply needed a better way to present their strengths. From this realization, Letraz was
				born—a tool designed to transform the process of resume creation, making it intuitive, efficient, and
				impactful.</p>

			<h3>Bringing Letraz to Life</h3>

			<p>A resume is more than a list of achievements; it’s a narrative. But crafting that narrative to align with
				specific job requirements takes time, effort, and skill. With Letraz, we set out to bridge that gap by
				merging technology with purpose.</p>

			<p><strong>Here’s how we’ve brought this vision to life:</strong></p>
			<ul>
				<li>Tailored Presentation: Letraz enables users to tailor their resumes to each job, ensuring their
					strengths align with what recruiters are looking for.
				</li>
				<li>ATS-Friendly by Design: Our system optimizes resumes for seamless parsing, making sure they clear
					the first hurdle.
				</li>
				<li>Effortless Creation: We handle the intricacies, so users can focus on showcasing their uniqueness,
					without getting lost in formatting or phrasing.
				</li>
			</ul>

			<p>Behind the scenes, AI powers this process, but it’s not the centerpiece of Letraz. For us, AI is just a
				tool to help users refine their craft—a way to transform effort into results without adding unnecessary
				complexity.</p>

			<h3>What Drives Us</h3>
			<p>At Letraz, our mission goes beyond building software. We see every user as a storyteller, presenting
				their career journey in a way that resonates. Our role is to provide the tools to help them craft these
				stories effectively.</p>

			<p><strong>Here’s what we stand for:</strong></p>
			<ul>
				<li>Empowering Users: Letraz exists to amplify individual potential, equipping users to present their skills and achievements in the best possible light.</li>
				<li>Simplicity Meets Depth: Crafting a resume can feel overwhelming, but we believe the process should be as simple as possible while retaining depth and meaning.</li>
				<li>Purposeful Innovation: Technology is not the story—it’s the enabler. Our focus is on solving real problems, not just showcasing AI for its own sake.</li>
			</ul>

			<h3>The Art of the Future</h3>

			<p>Building top-notch resumes is, in many ways, an art. It requires balance—between detail and simplicity, creativity and structure. At Letraz, we don’t create the art; we provide the brushstrokes, the tools, and the frame. We want every user to feel empowered, confident, and capable of crafting their own masterpiece.</p>
			<p>As we look ahead, we see Letraz evolving beyond resumes into a holistic career companion. From interview preparation to networking strategies, we aim to support users at every stage of their professional journey.</p>
			<p>For now, our focus remains clear: to simplify the process of creating tailored resumes that connect talent with opportunity. Because when the right tools meet the right hands, the results are nothing short of exceptional.</p>
			<p>Letraz is here to empower creators. Together, let’s craft a world where potential meets purpose—and every job seeker has the chance to tell their story with confidence.</p>
		</motion.div>
	)
}

export default LetrazStoryPageContent
