"""
Discord 웹훅 포스팅 모듈
"""
import requests
from typing import Optional
from rich.console import Console

import sys
sys.path.append('..')
from config.settings import DISCORD_WEBHOOKS, TEMPLATES, HIDDENDESK_URL, GAMES

console = Console()


class DiscordPoster:
    def __init__(self):
        self.webhooks = DISCORD_WEBHOOKS

    def send_embed(
        self,
        webhook_name: str,
        title: str,
        description: str,
        url: Optional[str] = None,
        color: int = 0x00FF88,
        image_url: Optional[str] = None,
        fields: Optional[list[dict]] = None,
        dry_run: bool = True,
    ) -> dict:
        """
        Discord 웹훅으로 Embed 메시지 전송

        Args:
            webhook_name: 웹훅 이름 (settings.py에 정의된 키)
            title: Embed 제목
            description: Embed 설명
            url: 제목 클릭 시 이동할 URL
            color: Embed 색상 (hex)
            image_url: 이미지 URL
            fields: 추가 필드 [{"name": "...", "value": "...", "inline": True}, ...]
            dry_run: True면 실제 전송 안함
        """
        webhook_url = self.webhooks.get(webhook_name)

        if not webhook_url:
            return {"success": False, "error": f"Webhook '{webhook_name}' not found"}

        embed = {
            "title": title,
            "description": description,
            "color": color,
        }

        if url:
            embed["url"] = url

        if image_url:
            embed["image"] = {"url": image_url}

        if fields:
            embed["fields"] = fields

        embed["footer"] = {
            "text": "HiddenDesk - Games Disguised as Work Apps",
        }

        payload = {
            "embeds": [embed],
        }

        result = {
            "webhook": webhook_name,
            "title": title,
            "dry_run": dry_run,
        }

        if dry_run:
            console.print(f"\n[yellow]== DRY RUN (실제 전송 안함) ==[/yellow]")
            console.print(f"[cyan]Webhook:[/cyan] {webhook_name}")
            console.print(f"[cyan]Title:[/cyan] {title}")
            console.print(f"[cyan]Description:[/cyan] {description[:200]}...")
            result["success"] = True
            result["message"] = "Dry run completed"
            return result

        try:
            response = requests.post(
                webhook_url,
                json=payload,
                headers={"Content-Type": "application/json"},
            )

            if response.status_code == 204:
                result["success"] = True
                console.print(f"[green]Discord 전송 성공: {webhook_name}[/green]")
            else:
                result["success"] = False
                result["error"] = f"Status {response.status_code}: {response.text}"
                console.print(f"[red]Discord 에러: {result['error']}[/red]")

        except Exception as e:
            result["success"] = False
            result["error"] = str(e)
            console.print(f"[red]에러: {e}[/red]")

        return result

    def send_to_all_webhooks(
        self,
        title: str,
        description: str,
        dry_run: bool = True,
    ) -> list[dict]:
        """모든 웹훅에 전송"""
        results = []

        for webhook_name in self.webhooks.keys():
            if self.webhooks[webhook_name]:  # URL이 설정된 경우만
                result = self.send_embed(
                    webhook_name=webhook_name,
                    title=title,
                    description=description,
                    url=HIDDENDESK_URL,
                    dry_run=dry_run,
                )
                results.append(result)

        return results

    def post_hiddendesk_launch(self, dry_run: bool = True) -> list[dict]:
        """HiddenDesk 런칭 알림"""
        template = TEMPLATES["discord_announce"]

        # 게임 목록을 필드로 추가
        fields = []
        for game in GAMES[:4]:  # 처음 4개만
            fields.append({
                "name": f"{game['name']} ({game['disguise']})",
                "value": game['description'],
                "inline": False,
            })

        results = []
        for webhook_name, webhook_url in self.webhooks.items():
            if webhook_url:
                result = self.send_embed(
                    webhook_name=webhook_name,
                    title=template["title"],
                    description=template["description"] + f"\n\n**Play now:** {HIDDENDESK_URL}",
                    url=HIDDENDESK_URL,
                    color=template["color"],
                    fields=fields,
                    dry_run=dry_run,
                )
                results.append(result)

        return results


def generate_webhook_url_guide():
    """Discord 웹훅 생성 가이드"""
    guide = """
[bold cyan]Discord 웹훅 생성 방법[/bold cyan]

1. Discord 서버에서 채널 선택
2. 채널 설정 (톱니바퀴) 클릭
3. '연동' 탭 선택
4. '웹후크' 클릭
5. '새 웹후크' 클릭
6. 이름 설정 (예: HiddenDesk Bot)
7. '웹후크 URL 복사' 클릭
8. .env 파일에 붙여넣기

[dim]웹훅 URL 형식: https://discord.com/api/webhooks/xxxxx/yyyyy[/dim]
"""
    console.print(guide)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Discord Poster for HiddenDesk")
    parser.add_argument("--guide", action="store_true", help="웹훅 생성 가이드")
    parser.add_argument("--post", action="store_true", help="포스팅 실행")
    parser.add_argument("--live", action="store_true", help="실제 전송 (기본: dry-run)")

    args = parser.parse_args()

    if args.guide:
        generate_webhook_url_guide()
    elif args.post:
        poster = DiscordPoster()
        poster.post_hiddendesk_launch(dry_run=not args.live)
    else:
        parser.print_help()
