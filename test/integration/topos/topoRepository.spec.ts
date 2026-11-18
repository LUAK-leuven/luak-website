import { expect, test } from 'vitest';

import { SupabaseTopoRepository } from '#server/adapter-supabase/topo/repository';
import { testServiceBuilder } from '#test/testServices';

const { supabase, testDao } = testServiceBuilder();

const addFullTopo = () =>
  testDao().addTopo({
    amount: 2,
    title: 'Mapping topo',
    authors: ['Marc Bott', 'Jane Doe'],
    condition: 'good',
    countries: ['Belgium'],
    details: 'A detailed description',
    place_in_library: 'France',
    tags: [' Epicenter '],
    types_of_climbing: ['Sport climbing', 'Multipitch'],
    year_published: 2021,
  });

const addMinimalTopo = () => testDao().addTopo();

test.describe('SupabaseTopoRepository topo mapping', () => {
  test('getDetails maps all fields of a topo', async () => {
    const { topoId } = await addFullTopo();

    const details = await new SupabaseTopoRepository(supabase()).getDetails(
      topoId,
    );

    expect(details).toStrictEqual({
      id: topoId,
      amount: 2,
      authors: ['Marc Bott', 'Jane Doe'],
      condition: 'good',
      countries: ['Belgium'],
      details: 'A detailed description',
      languages: [],
      placeInLibrary: 'France',
      tags: ['Epicenter'],
      title: 'Mapping topo',
      typesOfClimbing: ['Sport climbing', 'Multipitch'],
      yearPublished: 2021,
    });
  });

  test('getDetails maps missing optional fields to undefined', async () => {
    const { topoId } = await addMinimalTopo();

    const details = await new SupabaseTopoRepository(supabase()).getDetails(
      topoId,
    );

    expect(details).toStrictEqual({
      id: topoId,
      amount: 1,
      authors: [],
      condition: undefined,
      countries: [],
      details: undefined,
      languages: [],
      placeInLibrary: 'test',
      tags: [],
      title: 'Test topo',
      typesOfClimbing: [],
      yearPublished: undefined,
    });
  });

  test('getTopoLibrary maps all fields and undefined year_published', async () => {
    const { topoId: fullTopoId } = await addFullTopo();
    const { topoId: bareTopoId } = await addMinimalTopo();

    const library = await new SupabaseTopoRepository(
      supabase(),
    ).getTopoLibrary();

    expect(library.find((topo) => topo.id === fullTopoId)).toStrictEqual({
      id: fullTopoId,
      authors: ['Marc Bott', 'Jane Doe'],
      condition: 'good',
      countries: ['Belgium'],
      placeInLibrary: 'France',
      tags: ['Epicenter'],
      title: 'Mapping topo',
      typesOfClimbing: ['Sport climbing', 'Multipitch'],
      yearPublished: 2021,
      amount: 2,
      details: 'A detailed description',
      languages: [],
    });
    expect(library.find((topo) => topo.id === bareTopoId)).toStrictEqual({
      id: bareTopoId,
      authors: [],
      condition: undefined,
      countries: [],
      placeInLibrary: 'test',
      tags: [],
      title: 'Test topo',
      typesOfClimbing: [],
      yearPublished: undefined,
      amount: 1,
      details: undefined,
      languages: [],
    });
  });

  test('getTopos maps year_published and rental item id', async () => {
    const { topoId: fullTopoId, rentalItemId: fullRentalItemId } =
      await addFullTopo();
    const { topoId: bareTopoId, rentalItemId } = await addMinimalTopo();

    const topos = await new SupabaseTopoRepository(supabase()).getTopos();

    expect(topos.find((topo) => topo.id === fullTopoId)).toStrictEqual({
      id: fullTopoId,
      rentalItemId: fullRentalItemId,
      title: 'Mapping topo',
      initialAmount: 2,
      yearPublished: 2021,
    });
    expect(topos.find((topo) => topo.id === bareTopoId)).toStrictEqual({
      id: bareTopoId,
      rentalItemId,
      title: 'Test topo',
      initialAmount: 1,
      yearPublished: undefined,
    });
  });
});
