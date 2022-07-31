# 원티드 프리온보딩 개인과제 SNS 서비스

## 프로젝트 진행 기간
1차 개발기간: `2022.07.20 ~ 07.26` <br/>
2차 추가 개발기간: `2022.07.27 ~ 07.31`

## 사용 기술

- Typescript, NestJS
- JWT
- Github

## 서비스 개요

- 사용자는 SNS에 가입하여 게시글을 작성,수정,삭제,복구하고 다른사람의 게시글을 확인하고, 게시글에 좋아요를 할 수 있습니다.

## 요구사항 분석

A. 유저관리

- 회원가입
    - 이메일, 비밀번호, 닉네임을 입력받아 회원가입을 진행합니다.
- 로그인 및 인증
    - 로그인시 액세스 토큰과 리프레쉬 토큰을 발급받습니다.

B. 게시글

- 작성
    - 제목, 내용, 해시태그를 입력하여 글을 작성합니다.
- 수정
    - 작성자만 해당 게시글을 수정합니다.
- 삭제
    - 작성자만 해당 게시글을 삭제합니다.
- 복구
    - 삭제된 글의 경우 작성자만 해당 게시글을 복구합니다.
- 목록
    - 삭제되지 않은 게시글에 한해 목록 조회가 가능합니다.
    - 세부 조회 기능 (개별 조건조회 작동, 일괄 조건조회 작동)
        - 정렬 : 정렬기준을 쿼리로 받아 내림차순 정렬을 할 수 있습니다.
        - 제목 키워드 검색 : 키워드를 쿼리로 받아 제목에 키워드가 포함된 게시글을 찾을 수 있습니다.
        - 해쉬태그 검색 : 입력한 해쉬태그가 포함된 게시글을 찾을 수 있습니다.
- 상세보기
    - 게시물 상세보기를 할때마다 조회수가 1 증가합니다.
    - 작성자를 포함한 모든 사용자는 게시글에 좋아요를 누를 수 있습니다.
    - 좋아요! : 좋아요를 최초 누른경우 ‘좋아요'수가 1 증가
    - 좋아요취소!: 중복으로 누른경우 ‘좋아요'수가 1 감소

## API Docs

| HTTP Method | URI | Function Name | Error Code |
| --- | --- | --- | --- |
| POST | /sns/auth/sign-up | 회원가입 |  |
| POST | /sns/auth/sign-in | 로그인 | 401 Unauthorized |
| POST | /sns/posts | 게시글 작성 |  |
| GET | /sns/posts | 게시글 목록 조회 |  |
| GET | /sns/posts/<id> | 게시글 상세조회 | 404 NotFoundException |
| PATCH | /sns/posts/<id> | 게시글 수정 | 400 BadRequestException / 403 ForbiddenException |
| PATCH | /sns/posts/<id>/restore | 게시글 복구 | 403 ForbiddenException (이중복구 / 작성자 본인이 아닌경우) |
| DELETE | /sns/posts/<id> | 게시글 삭제 | 403 ForbiddenException (이중삭제 / 작성자 본인이 아닌경우) |
| GET | /sns/posts/<id>/like | 게시글 좋아요 | 400 BadRequestException  |

## ERD


![스크린샷 2022-07-28 오후 6 18 24](https://user-images.githubusercontent.com/85995802/181470014-af202ef4-3236-4eba-b399-be495469ce77.png)


## 프로젝트 일정관리
깃헙의 이슈와 프로젝트 칸반보드를 사용하여 일정을 관리하며 프로젝트를 진행했습니다   


![스크린샷 2022-07-28 오전 11 11 04](https://user-images.githubusercontent.com/85995802/181437201-c6daf60e-73db-4174-addb-7b9692003835.png)
