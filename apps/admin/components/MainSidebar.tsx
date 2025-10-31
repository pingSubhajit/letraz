import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	SidebarSeparator
} from '@/components/ui/sidebar'
import {BookCheck, ExternalLink, GitPullRequest, Home, Users, Wrench} from 'lucide-react'
import pfp1 from '@/public/pfp1.png'
import Image from 'next/image'
import {SiAlgolia, SiCircleci, SiLinear, SiPosthog, SiSentry} from 'react-icons/si'
import Link from 'next/link'
import {LogoutButton} from '@/components/LogoutButton'

const items = [
	{
		title: 'Dashboard',
		url: '/',
		icon: Home
	},
	{
		title: 'Linear',
		url: 'https://linear.app/letraz/project/letraz-3cb0dac22830/overview',
		icon: SiLinear
	},
	{
		title: 'Posthog',
		url: 'https://us.posthog.com/project/93055',
		icon: SiPosthog
	},
	{
		title: 'Sentry',
		url: 'https://letraz-app.sentry.io',
		icon: SiSentry
	},
	{
		title: 'Documentation',
		url: 'https://outline.letraz.app',
		icon: BookCheck
	},
	{
		title: 'Resend',
		url: 'https://resend.com/emails',
		icon: ExternalLink
	},
	{
		title: 'Knock',
		url: 'https://dashboard.knock.app/letraz/production/workflows',
		icon: ExternalLink
	},
	{
		title: 'Loops',
		url: 'https://app.loops.so/home',
		icon: ExternalLink
	},
	{
		title: 'Freshdesk',
		url: 'https://letraz.freshdesk.com/a/tickets/filters/all_tickets',
		icon: ExternalLink
	},
	{
		title: 'Basehub',
		url: 'https://basehub.com/letraz/letraz/explore',
		icon: ExternalLink
	},
	{
		title: 'CircleCI',
		url: 'https://app.circleci.com/organization/circleci/4zsPWY8VeKUfzLLyyHdu7g',
		icon: SiCircleci
	},
	{
		title: 'Algolia',
		url: 'https://dashboard.algolia.com/apps/MWTSY55C5C/dashboard',
		icon: SiAlgolia
	}
]

const tools = [
	{
		title: 'Generate PR writeup',
		url: '/generate-pr',
		icon: GitPullRequest
	},
	{
		title: 'Waitlist Management',
		url: '/waitlist',
		icon: Users
	},
	{
		title: 'Team Management',
		url: '/team-management',
		icon: Users
	},
	{
		title: 'Repository Settings',
		url: '/settings',
		icon: Wrench
	}
]

const MainSidebar = () => (
	<Sidebar>
		<SidebarHeader className="p-4">
			<SidebarMenu>
				<SidebarMenuItem>
					<div className="flex items-center gap-1.5">
						<Image src={pfp1} alt="Letraz logo" placeholder="blur" className="w-5 h-5 rounded-sm" />
						<p className="font-medium text-sm">Letraz</p>
					</div>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarHeader>

		<SidebarSeparator />

		<SidebarContent>
			<SidebarGroup>
				<SidebarGroupLabel>Quick links</SidebarGroupLabel>
				<SidebarGroupContent>
					<SidebarMenu>
						{items.map((item) => (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton asChild>
									{item.url[0] === '/'
										? (<Link href={item.url}>
											<item.icon/>
											<span>{item.title}</span>
										</Link>
										) : (
											<a href={item.url} target="_blank">
												<item.icon/>
												<span>{item.title}</span>
											</a>
										)
									}
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>

			<SidebarSeparator />

			<SidebarGroup>
				<SidebarGroupLabel>Convenience tools</SidebarGroupLabel>
				<SidebarGroupContent>
					<SidebarMenu>
						{tools.map((item) => (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton asChild>
									{item.url[0] === '/'
										? (<Link href={item.url}>
											<item.icon/>
											<span>{item.title}</span>
										</Link>
										) : (
											<a href={item.url} target="_blank">
												<item.icon/>
												<span>{item.title}</span>
											</a>
										)
									}
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>

			<SidebarRail />
		</SidebarContent>
		<SidebarFooter className="p-4">
			<LogoutButton />
		</SidebarFooter>
	</Sidebar>
)

export default MainSidebar
