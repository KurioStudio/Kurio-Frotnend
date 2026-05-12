import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getFollowersCount, getFollowedCount, findPostsByTitle, getProfileUserById, checkIfUserFollows } from './peticiones'

const originalFetch = global.fetch

describe('peticiones utils', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    global.fetch = originalFetch
  })

  it('getFollowersCount - array response', async () => {
    ;(global.fetch as any) = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [1, 2, 3],
    })

    const res = await getFollowersCount('user')
    expect(res).toBe(3)
  })

  it('getFollowersCount - numeric response', async () => {
    ;(global.fetch as any) = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => 5,
    })

    const res = await getFollowersCount('user')
    expect(res).toBe(5)
  })

  it('getFollowersCount - string response', async () => {
    ;(global.fetch as any) = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => '4',
    })

    const res = await getFollowersCount('user')
    expect(res).toBe(4)
  })

  it('getFollowersCount - not ok', async () => {
    ;(global.fetch as any) = vi.fn().mockResolvedValue({ ok: false })
    const res = await getFollowersCount('user')
    expect(res).toBe(0)
  })

  it('getFollowersCount - json throws, text fallback numeric', async () => {
    ;(global.fetch as any) = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => { throw new Error('bad json') },
      text: async () => '7'
    })

    const res = await getFollowersCount('user')
    expect(res).toBe(7)
  })

  it('findPostsByTitle - maps posts correctly', async () => {
    const fakePosts = [
      {
        id: 'p1',
        titulo: 'T1',
        imagenes: ['i1'],
        user: { id: 'u1', username: 'name', avatarImg: 'a', email: 'e' },
        likedBy: ['x']
      }
    ]

    ;(global.fetch as any) = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => fakePosts
    })

    const res = await findPostsByTitle('T1')
    expect(res).toHaveLength(1)
    expect(res[0].id).toBe('p1')
    expect(res[0].image).toBe('i1')
    expect(res[0].username).toBe('name')
  })

  it('getProfileUserById - computes follower counts and flags', async () => {
    const user = {
      id: 'u1',
      username: 'user1',
      email: 'e',
      avatarImg: 'a',
      createdAt: 'd',
      followersList: ['a', 'b', 'c'],
      followingList: ['x'],
      isFollowedByCurrentUser: true
    }

    ;(global.fetch as any) = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => user
    })

    const res = await getProfileUserById('u1')
    expect(res.id).toBe('u1')
    expect(res.followersCount).toBe(3)
    expect(res.followingCount).toBe(1)
    expect(res.isFollowedByCurrentUser).toBe(true)
  })

  it('checkIfUserFollows - parses various textual responses', async () => {
    ;(global.fetch as any) = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => 'true'
    })
    expect(await checkIfUserFollows('a', 'b')).toBe(true)

    ;(global.fetch as any) = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => 'false'
    })
    expect(await checkIfUserFollows('a', 'b')).toBe(false)

    ;(global.fetch as any) = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '0'
    })
    expect(await checkIfUserFollows('a', 'b')).toBe(true)

    ;(global.fetch as any) = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '-1'
    })
    expect(await checkIfUserFollows('a', 'b')).toBe(false)

    ;(global.fetch as any) = vi.fn().mockResolvedValue({ ok: false })
    expect(await checkIfUserFollows('a', 'b')).toBe(false)
  })
})
