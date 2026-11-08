"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { FilterMenu } from "@/components/app/admin/FilterMenu";
import { RequirementsCatalog } from "@/components/app/admin/RequirementsCatalog";
import { RequirementsSelect } from "@/components/app/admin/RequirementsSelect";
import { Button } from "@/components/ui/button";
import { filterParticipants } from "@/lib/admin/participants";
import { useAdmin } from "@/lib/admin/store";
import { NO_FILTERS, type ParticipantFilters } from "@/lib/admin/types";

const COLUMNS = ["Nombre", "Tipo de participante", "Evento", "Requerimientos"] as const;

/** Admin home (Paper E0-0): filterable participants table. */
export function AdminHome() {
  const { participants } = useAdmin();
  const [filters, setFilters] = useState<ParticipantFilters>(NO_FILTERS);
  const rows = useMemo(() => filterParticipants(participants, filters), [participants, filters]);

  return (
    <section aria-labelledby="participantes" className="pt-6 lg:pt-[33px]">
      {/* Own stacking layer above the table: the BeUI Select list renders inline, and
          each row's multi-select trigger is `z-20`, which would otherwise cover it. */}
      <div className="relative z-30 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <h2 id="participantes" className="text-2xl font-medium leading-none text-white sm:text-3xl">
            Participantes
          </h2>
          <FilterMenu filters={filters} onChange={setFilters} />
        </div>
        <RequirementsCatalog />
      </div>

      <div className="mt-6">
        {/* Mobile: one stacked card per participant (the table needs 860px). */}
        <ul className="space-y-3 md:hidden" aria-label="Participantes">
          {rows.map((participant) => (
            <li key={participant.id} className="rounded-xl border border-white/10 bg-[#0f0f10] p-4">
              <p className="break-words text-base font-medium text-white">{participant.fullName}</p>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
                <div className="min-w-0">
                  <dt className="text-xs font-bold text-white/55">{COLUMNS[1]}</dt>
                  <dd className="break-words text-white">{participant.type}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs font-bold text-white/55">{COLUMNS[2]}</dt>
                  <dd className="break-words text-white">{participant.event}</dd>
                </div>
              </dl>
              <div className="mt-3">
                <p className="mb-1 text-xs font-bold text-white/55">{COLUMNS[3]}</p>
                <RequirementsSelect participantId={participant.id} />
              </div>
              <Button asChild variant="secondary" shape="pill" size="xl" className="mt-4 w-full">
                <Link
                  href={`/admin/participantes/${participant.id}`}
                  aria-label={`Ver perfil de ${participant.fullName}`}
                >
                  Ver Perfil
                </Link>
              </Button>
            </li>
          ))}
        </ul>

        <div className="hidden overflow-x-auto scrollbar-hide md:block">
        {/* Fixed layout: column widths come from the <colgroup>, never from the rows,
            so filtering or long values can't resize them (long text truncates). */}
        <table className="w-full min-w-[860px] table-fixed border-collapse text-left text-[13px] text-white">
          <caption className="sr-only">Participantes de ARTBO Feria y Fin de Semana ARTBO</caption>
          <colgroup>
            <col />
            <col className="w-[170px]" />
            <col className="w-[170px]" />
            <col className="w-[244px]" />
            <col className="w-[120px]" />
          </colgroup>
          <thead>
            <tr className="border-b border-white/15 text-xs font-bold text-white/55">
              {COLUMNS.map((column) => (
                <th key={column} scope="col" className="truncate px-3 py-3 font-bold">
                  {column}
                </th>
              ))}
              <th scope="col" className="px-3 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((participant) => (
              <tr key={participant.id} className="border-b border-white/10 transition-colors hover:bg-white/[0.03]">
                <th scope="row" className="truncate px-3 py-3 text-sm font-normal" title={participant.fullName}>
                  {participant.fullName}
                </th>
                <td className="truncate px-3 py-3">{participant.type}</td>
                <td className="truncate px-3 py-3">{participant.event}</td>
                <td className="px-3 py-3">
                  <RequirementsSelect participantId={participant.id} />
                </td>
                <td className="px-3 py-3 text-right">
                  <Button asChild variant="secondary" shape="pill" size="sm">
                    <Link
                      href={`/admin/participantes/${participant.id}`}
                      aria-label={`Ver perfil de ${participant.fullName}`}
                    >
                      Ver Perfil
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center text-sm text-white/70">
            <p>No hay participantes con estos filtros.</p>
            <Button type="button" variant="outline" shape="pill" size="sm" onClick={() => setFilters(NO_FILTERS)}>
              Limpiar filtros
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
